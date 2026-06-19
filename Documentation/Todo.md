# TODO - this is where we decide and describe the next steps we will make.

### P1 - Improve architecture of this application

The current architecture is clean and well-tested, but several patterns will become
painful as the app grows (notably when the "Play against algorithm" mode below is added,
which roughly doubles the state-machine complexity). The items below are listed in the
order we should implement them — driven by dependencies and risk, not raw severity. The
first four are worth completing before starting the algorithm mode.

#### P1.1. Compute derived state, and make feedback correct in the general case

**Problem.** Whether the player won is recomputed and stored. `calculateFeedback` uses
`answer.includes(color)` ([row.js:13](../src/mastermind/reducers/row.js#L13)), which only
produces correct white counts because the secret currently has unique colors. It silently
miscounts if duplicate colors are ever allowed.

**Why first.** Small, isolated, and a correctness fix rather than a refactor. The algorithm
mode consumes feedback to pick its next guess, so a correct `calculateFeedback` is a
prerequisite for that work.

**Fix.**

- [x] Rewrite `calculateFeedback` to be correct for codes with duplicate colors (the
      standard two-pass count: exact matches first, then match remaining by color counts),
      so a future rules change cannot quietly corrupt feedback. Added tests for the
      duplicate case in [row.test.js](../src/mastermind/reducers/row.test.js).
- [x] Extracted the win check into a shared pure `isSolved(feedback)` helper
      ([row.js](../src/mastermind/reducers/row.js)), now used by the root reducer.
- [ ] Derive win/lose from the board + feedback rather than storing it. **Deferred to
      item 3** — removing the stored `gameStatus` is part of the state-machine work and
      shouldn't be done piecemeal here.

#### P1.2. Make the combined reducers truly independent

**Problem.** In [stateReducers.js](../src/mastermind/reducers/stateReducers.js),
`reduceSingleAction` computes `activeRow`, `selectedPeg`, and `secretCode` first and then
_passes them into_ `boardReducer`. So the board reducer depends on the freshly-computed
output of its sibling reducers within the same tick — a hidden ordering dependency, which
is exactly what `combineReducers` is designed to forbid. Reordering those lines silently
breaks the board.

**Why second.** Isolated cleanup that removes the hidden coupling and makes reasoning about
the next two steps much easier.

**Fix.**

- [x] Removed the cross-reducer arguments — `boardReducer` is now `(state, action)` and
      every slice reducer in `reduceSingleAction` depends only on its own previous state
      and the action, so their order no longer matters.
- [x] Added a `decorateAction` step in [stateReducers.js](../src/mastermind/reducers/stateReducers.js)
      that attaches the context the board needs (`activeRow`, `selectedPeg`, `secretCode`)
      to the action, all derived from the _previous_ state (`BEGIN_NEW_ROW` carries the
      incremented row index). Added a regression test that the next row becomes active and
      selectable after a non-winning submit.

#### P1.3. Model the game as an explicit finite state machine

**Problem.** `gameStatus` (intro / playing / won / lost / gave*up) and its transitions are
a textbook state machine, but the state is spread across several independent boolean
reducers (`isCodeHidden`, `isRevealHidden`, `showColorPicker`, `gameStatus`) that must be
kept mutually consistent by hand. That is why winning has to separately fire `GAME_WIN`
\_and* `REVEAL_SECRET_CODE`, and why illegal combinations (e.g. "won but code still hidden")
are representable at all.

**Why third.** It is the foundation for item 4 — the orchestration cleanup routes through
this machine, so the machine has to exist first. Together with item 4 this is really one
piece of work.

**Fix.**

- [x] Introduced a hand-rolled transition table + `nextStatus(status, event)` in
      [gameStatus.js](../src/mastermind/gameStatus.js). Illegal transitions are ignored
      (status unchanged); `EVENT_RESET` returns to intro from anywhere. The status reducer
      now just maps an action to an event and runs it through the table.
- [x] Stopped storing `isCodeHidden`/`isRevealHidden`. They're derived from the status via
      selectors (`isCodeHidden`, `canGiveUp`, `isGameOver`) computed in
      [App.jsx](../src/mastermind/App.jsx), so they can't drift. (`isRevealHidden` was also
      renamed to the clearer `canGiveUp`.) `showColorPicker` stays stored — it's genuine
      in-play interaction state, not a function of the status — but is forced false on any
      status-changing action.
- [x] Added [gameStatus.test.js](../src/mastermind/gameStatus.test.js) covering the
      transitions, ignored illegal events, reset-from-anywhere, and the selectors.

**Behavior change (latent bug fixed):** previously `isRevealHidden` had no `lose` case, so
the "Give up" button stayed visible after losing and clicking it overwrote the `lost`
status with `gave_up`. Deriving `canGiveUp` from the status (true only while `playing`)
removes that. Captured by a new assertion in the lose test.

#### P1.4. Stop orchestrating sequences of actions inside the root reducer

**Problem.** [reducers/index.js](../src/mastermind/reducers/index.js) takes one high-level
action and manually runs a _sequence_ of low-level actions through `reduceSingleAction`,
threading state between them (e.g. `SUBMIT_ROW` chains `GIVE_FEEDBACK` → `HIDE_COLOR_PICKER`
→ a win/lose decision). A reducer is meant to be a pure `(state, action) → state` with no
orchestration. The result is that the core game logic ("did they win?", "is this the last
row?") lives in an action-expansion layer, which is the least obvious place to look for it.

**Why fourth.** This cannot be finished cleanly without the state machine from item 3; do
it immediately after, as part of the same effort.

**Fix (done together with item 3).**

- [x] The low-level action layer (`GIVE_FEEDBACK`, `BEGIN_NEW_ROW`, `REVEAL_SECRET_CODE`,
      `GAME_BEGIN/WIN/LOSE/...`, etc.) is gone. Every slice reducer now responds directly to
      the real high-level action, and [index.js](../src/mastermind/reducers/index.js) is a
      single-pass composition — no more `reduceSingleAction` chains and no reducer calling
      another reducer.
- [x] The submit outcome (win / lose / continue) is decided once in `decorateAction`
      ([index.js](../src/mastermind/reducers/index.js)) and carried on the action; the
      status reducer turns it into a machine event. Transitions live only in the item-3
      table.
- [x] `row.js` is now just the pure `calculateFeedback`/`isSolved` helpers; the per-row peg
      and feedback writes moved into [board.js](../src/mastermind/reducers/board.js), which
      also handles high-level actions directly. Removed the now-dead `beginNewRow` action
      and `ROW_START` constant.

#### P1.5. Replace blanket prop-drilling with context (or explicit props)

**Problem.** [App.jsx](../src/mastermind/App.jsx) builds one large props object that is
`{...props}`-spread through [Gameplay.jsx](../src/mastermind/components/Gameplay.jsx) into
[BoardRow.jsx](../src/mastermind/components/BoardRow.jsx) and on into its children. You
cannot tell what a component actually consumes without reading its body, and every
component is coupled to the full state shape.

**Why fifth.** Independent of the reducer work, but worth doing before the algorithm mode,
which adds new components to wire in.

**Fix.**

- [x] Added a small [GameContext.js](../src/mastermind/GameContext.js) (`GameContext` +
      `useGame()`). [App.jsx](../src/mastermind/App.jsx) provides the whole-game view state
      and handlers once; gameplay components read what they need via `useGame()`.
- [x] Removed every blanket `{...props}` spread. Genuinely per-instance values (a row's
      `pegs`/`feedbackPegs`/`isActiveRow`, a peg's `id`) stay explicit props; reusable leaf
      components (`Peg`, `Feedback`, `Hole`, `Checkmark`) remain prop-driven on purpose.
- [x] This is the seam the algorithm mode can hang its own handlers/state off of.

#### P1.6. Replace overloaded sentinel strings and add type safety

**Problem.** Peg slots hold `'none'`, `'select'`, and color names in the same field
([row.js](../src/mastermind/reducers/row.js)), overloading one value with three meanings.
There are no types to catch a mismatched sentinel or a bad action shape.

**Why sixth.** Adopting TypeScript is disruptive. Either commit to it _first of all_ (so
every later edit is type-checked) or do it _last_ (type stable code rather than code you
are about to move) — don't sandwich it between the refactors. Listed last here on the
assumption we'd rather not block the refactors on a big-bang migration.

**Decision:** scoped to the core domain only — state, actions, the machine, and the
reducers are TypeScript; the React components stay `.jsx` for now (`allowJs` is off, so
they aren't type-checked). Vite/Vitest resolve the existing `.js` import specifiers to the
`.ts` files, so no importers had to change.

**Fix.**

- [x] Added `typescript` + [tsconfig.json](../tsconfig.json) (strict) and a `typecheck`
      script; `npm run check` now runs `typecheck → test → build`.
- [x] Typed the domain in [types.ts](../src/mastermind/types.ts): `Color`, `PegValue`,
      `FeedbackPeg`, `Row`, `Board`, `GameState`. The status machine
      ([gameStatus.ts](../src/mastermind/gameStatus.ts)) has `GameStatus`/`GameEvent`
      unions; actions ([gameActions.ts](../src/mastermind/gameActions.ts)) are a typed
      discriminated `Action` union plus a `DecoratedAction`. All reducers and
      [constants.ts](../src/mastermind/script/constants.ts) are typed.
- [~] The overloaded sentinels (`'none'`/`'select'`) are now a type-safe `PegValue` union
  (`Color | 'none' | 'select'`) rather than the suggested discriminated _object_ shape.
  The union prevents mismatched sentinels with far less churn and keeps the board data
  flat; the heavier object refactor wasn't needed and would also touch the JS rendering
  components. Left as-is intentionally.

#### P1.7. (Minor) Don't persist the secret code in a readable form

**Problem.** The full state, including `secretCode`, is saved to `sessionStorage`, so the
answer is trivially readable in devtools — a cheat vector for a guessing game.

**Why last.** Trivial and optional; only matters if cheating is a concern.

**Decision: won't do.** Cheating via devtools isn't a real concern for this game, and
omitting the secret would mean losing an in-progress game on reload. Leaving the full
state persisted as-is.

### P1.8 - Complete transition to Typescript across the board - all js, jsx files

Item P1.6 typed the domain (state, actions, machine, reducers). What's left is the React
layer + infra: `GameContext.js`, `script/sessionStorage.js`, `main.jsx`, `App.jsx`, the 16
components, and the 5 test files. This is **not** a pure rename — turning on JSX/DOM
type-checking surfaces real prop/type work. Do it in this order (tooling first, then the
context boundary, then components bottom-up so parents rely on typed children):

#### P1.8.1 — Tooling

- [ ] Add `@types/react` + `@types/react-dom` dev deps.
- [ ] [tsconfig.json](../tsconfig.json): set `jsx: "react-jsx"`, add `DOM`/`DOM.Iterable`
      to `lib`, and keep `allowJs: true` **temporarily** so not-yet-migrated files still
      resolve and the build stays green mid-migration. No code changes in this step.

#### P1.8.2 — The context boundary (unblocks everything else)

- [ ] Convert `GameContext.js` → `.ts`. Define a `GameContextValue` interface (the state
      fields + handler signatures that [App.jsx](../src/mastermind/App.jsx) provides) and
      type `useGame()` to return it. Have `useGame()` throw if used outside a provider so
      consumers get a non-null type rather than `T | null`.

#### P1.8.3 — Leaf components (bottom-up, simple props)

- [ ] `Hole`, `Peg`, `PegIllu`, `PegSideways`, `SmallFeedbackPeg`, `SmallFeedbackHole`,
      `Checkmark`, `Feedback` → `.tsx`, each with a small prop interface. (Reuse `Color`,
      `PegValue`, `FeedbackPeg` from [types.ts](../src/mastermind/types.ts).)

#### P1.8.4 — Overlay / picker / intro components

- [ ] `Won`, `Lost`, `Gaveup`, `HiddenCode`, `ColorPicker`, `Intro` → `.tsx` (these read
      context via `useGame()` or take a couple of explicit props).

#### P1.8.5 — Containers + entry + infra

- [ ] `BoardRow`, `Gameplay`, `App` → `.tsx` (App's provider value typed as
      `GameContextValue`).
- [ ] `main.jsx` → `main.tsx`; `script/sessionStorage.js` → `.ts`, typing
      `loadState`/`saveState` against `GameState`.

#### P1.8.6 — Tests

- [ ] Convert `App.test.jsx`, `gameActions.test.js`, `gameStatus.test.js`,
      `reducers/reducer.test.js`, `reducers/row.test.js`, `script/sessionStorage.test.js`
      to `.ts`/`.tsx` so they're type-checked too.

#### P1.8.7 — Lock it down

- [ ] Flip `allowJs: false`, confirm no `.js`/`.jsx` remain under `src/`, and `npm run
      check` (typecheck → test → build) is green.

**Open decisions:**

- Convert the test files too (P1.8.6)? Recommended — straightforward and gives full
  coverage. The alternative is leaving them as JS (untyped but still run by Vitest).
- OK to add `@types/react` / `@types/react-dom`? (Needed for typed components.)
- Keep the current strictness, or add `noUncheckedIndexedAccess` while we're here? (It
  would flag `board[i]` accesses; more correct but more churn — suggest a separate pass.)

### P5 - Add a button on the main page that says 'Play against algorithm' -

Goal: The idea is to reverse the roles, so that it will be the computer (algorithm) that does the guessing and the

- [ ] There should we a nice interface where user can set a secret code.
- [ ] The algorithm should then start guessing the code filling up a row of the board at a time
- [ ] User should then have a nice interface to provide feedback.
- [ ] That process should loop until the computer has guessed the code.
