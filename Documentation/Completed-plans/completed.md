# Completed tasks

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

**Done.** The whole `src/` tree is now TypeScript — no `.js`/`.jsx` files remain.
`npm run check` (typecheck → test → build) is green; 35 tests pass.

- [x] **P1.8.1 — Tooling.** Added `@types/react` + `@types/react-dom`;
      [tsconfig.json](../tsconfig.json) now sets `jsx: "react-jsx"` and `DOM`/`DOM.Iterable`
      lib. Added `src/declarations.d.ts` (`declare module '*.css'`) for the stylesheet
      import. `allowJs` was on during the migration, then flipped off at the end.
- [x] **P1.8.2 — Context boundary.** [GameContext.ts](../src/mastermind/GameContext.ts)
      defines `GameContextValue` and a `useGame()` that throws outside a provider (so
      consumers get a non-null type).
- [x] **P1.8.3 — Leaf components.** `Hole`, `Peg`, `PegIllu`, `PegSideways`,
      `SmallFeedbackPeg`, `SmallFeedbackHole`, `Checkmark`, `Feedback` → `.tsx` with prop
      interfaces. Exported `TopViewColor`/`SidewaysColor` from
      [constants.ts](../src/mastermind/script/constants.ts) for the peg `colors` props.
- [x] **P1.8.4 — Overlay / picker / intro.** `Won`, `Lost`, `Gaveup`, `HiddenCode`,
      `ColorPicker`, `Intro` → `.tsx`.
- [x] **P1.8.5 — Containers + entry + infra.** `BoardRow`, `Gameplay`, `App` → `.tsx`;
      `main.tsx` (typed `useReducer`, guards the missing root element); `sessionStorage.ts`
      typed against `GameState`. Updated `index.html` to point at `main.tsx`.
- [x] **P1.8.6 — Tests.** All six test files converted to `.ts`/`.tsx` and type-checked.
- [x] **P1.8.7 — Lock it down.** `allowJs: false`; no `.js`/`.jsx` under `src/`; gate green.

**Decisions made:** converted the tests too (full coverage); added the React `@types`;
kept current strictness — `noUncheckedIndexedAccess` deferred to a separate pass (it would
flag every `board[i]` access; more correct but more churn).

**Note on import specifiers:** existing intra-`src` imports use `.js`/`.jsx` extensions (or
none). Vite, Vitest, and `tsc` (moduleResolution `bundler`) all resolve those to the `.ts`
/`.tsx` files, so importers didn't need rewriting; new files use extensionless specifiers.

## P2 - Add a button on the main page that says 'Play against algorithm' -

Goal: The idea is to reverse the roles, so that it will be the computer (algorithm) that does the guessing and the human that scores the guess.

Original intent:

- A nice interface where the user sets a secret code.
- The algorithm then guesses, filling up a row of the board at a time.
- The user has a nice interface to score each guess (feedback).
- That loops until the computer has guessed the code.

**Approach.** Reuse what's already there: the `Board`/`BoardRow`/`Peg`/`Feedback`
components, the pure `calculateFeedback`, the state machine, and `GameContext`. Build the
solver as a pure, tested module first, then wire the reducer, then the UI. Each step ends
with `npm run check` green.

**Design decisions (confirmed):**

1. **Feedback source.** The human scores each computer guess by hand (honors "provide
   feedback"); the secret they set is used to _validate_ that scoring and catch mistakes.
   _Alt:_ auto-score from the secret (removes the manual interface, contradicts the bullet).
2. **Solver strategy.** Start with "pick the first still-consistent candidate" over the
   1680 unique-color codes (8·7·6·5) — simple, fast, solves reliably. _Alt/later:_ Knuth
   minimax for fewer guesses.
3. **State-machine shape.** Extend the single existing machine with algorithm-mode statuses
   plus a top-level `mode`. _Alt:_ a separate machine per mode.
4. **Candidate set.** Not stored — derived each turn by filtering all codes against the
   (guess, feedback) pairs already on the board. Keeps state small and matches our
   "derive, don't store" approach.

### P2.1 — Solver core (pure + tested) ✅

- [x] [solver.ts](../src/mastermind/solver.ts): `allCodes()` (the 1680 unique-color
      permutations); `consistentCodes(history)` keeping codes where
      `calculateFeedback(candidate, guess)` matches the recorded reds/whites for every past
      (guess, feedback); `nextGuess(history)` returning the first consistent code.
- [x] `nextGuess` returns `undefined` when no code is consistent (contradictory feedback).
- [x] Tests in [solver.test.ts](../src/mastermind/solver.test.ts): `allCodes` shape,
      filtering correctness, contradictory feedback → empty, and a solve loop.
- Note: a full sweep over all 1680 secrets showed **worst case 7 guesses, avg 4.9** — so
  "first consistent candidate" always solves within the 10-row board; minimax not needed.

### P2.2 — Mode selection + state shape ✅

- [x] Added `mode: 'human' | 'algorithm'` ([types.ts](../src/mastermind/types.ts)) with a
      `modeReducer` and initial value `'human'`; `START_ALGORITHM` → algorithm, `START_GAME`
      / `RESET_ALL` → human. `mode` is on `GameContextValue`.
- [x] Intro screen: added a "Play against algorithm" button beside "Start game".
- [x] `START_ALGORITHM` action + creator wired to the button; App routes algorithm-mode
      statuses to a placeholder [AlgorithmGame](../src/mastermind/components/AlgorithmGame.tsx).
- [x] Tests: the action sets `mode` + `algo_setup`, and reset returns to human/intro.

### P2.3 — State machine for algorithm mode ✅

- [x] Added statuses `algo_setup`, `algo_guessing`, `algo_solved`, `algo_failed` and events
      `START_ALGORITHM`, `CONFIRM_SECRET`, `SOLVED`, `FAILED` to
      [gameStatus.ts](../src/mastermind/gameStatus.ts); `RESET` → intro still applies. (The
      `CONFIRM_SECRET`/`SOLVED`/`FAILED` transitions exist now; their driving actions land in
      P2.4/P2.5.)
- [x] `isGameOver` now covers `algo_solved`/`algo_failed`.
- [x] Tests for the algorithm transitions and ignored illegal events.

### P2.4 — Secret-setup interface ✅

- [x] [SecretSetup.tsx](../src/mastermind/components/SecretSetup.tsx): pick 4 colors from a
      `PegIllu` palette that disables already-used colors (codes never repeat a color);
      "Let the computer guess" is enabled only once 4 are chosen.
- [x] `CONFIRM_SECRET` reducer: stores the secret, transitions to `algo_guessing`, and
      places the computer's opening guess (`nextGuess([])`) on row 0.

### P2.5 — Guess/feedback loop (reducer ↔ solver) ✅

- [x] `SUBMIT_FEEDBACK` reducer (`decorateAction` in
      [index.ts](../src/mastermind/reducers/index.ts)): records the human's feedback on the
      active row; all-red → `algo_solved`; else derives `nextGuess` from board history and
      places it on the next row; no codes left or out of rows → `algo_failed`.
- [x] Candidate set is derived from the board rows each turn — nothing stored.
- [x] Tests: confirm-secret placement, a full honest-feedback solve reaching `algo_solved`,
      and impossible feedback reaching `algo_failed`.
- Note: the algorithm-mode screens exist but are minimal — `algo_guessing` shows the board
  read-only ([AlgorithmBoard](../src/mastermind/components/AlgorithmBoard.tsx)) pending the
  P2.6 scoring UI, and results use a basic [AlgorithmResult](../src/mastermind/components/AlgorithmResult.tsx).

### P2.6 — Feedback input UI

Interaction (mirrors the color picker's fill-and-advance flow): the human scores the
computer's guess one feedback slot at a time, left to right, with an active-slot indicator.
The active slot offers three choices — **red**, **white**, or **✗ (done)**:

- Red or white fills the slot and advances to the next slot.
- ✗ finalizes scoring: the remaining slots stay empty (`none`) and the solver continues.
- Filling all four slots finalizes automatically (no ✗ needed).
- Reds/whites may be entered in any order — only the counts matter. So "all wrong" is just
  ✗ on the first slot; "2 red, 1 white" is red → red → white → ✗.

- [x] [FeedbackPicker.tsx](../src/mastermind/components/FeedbackPicker.tsx): red/white
      `SmallFeedbackPeg` options plus an ✗ "no more pegs" option, an active-slot indicator,
      and fill-and-advance / ✗-finalizes / auto-finalize-at-four behavior. Wired into the
      active row of [AlgorithmBoard](../src/mastermind/components/AlgorithmBoard.tsx)
      (keyed by `activeRow` so it resets per guess).
- [x] On finalize it dispatches `SUBMIT_FEEDBACK` (`onSubmitFeedback`).
- [x] Validates the finalized score against the set secret; on mismatch it warns and clears
      so the human re-scores, rather than feeding the solver a wrong number.
- [x] Tests (in [App.test.tsx](../src/mastermind/App.test.tsx)): a correct score dispatches
      `SUBMIT_FEEDBACK`; an incorrect score dispatches nothing and shows the warning.

### P2.7 — Result + reset ✅

- [x] [AlgorithmResult](../src/mastermind/components/AlgorithmResult.tsx) shows the secret
      bar + the full guess history + a "cracked it in N guesses" or
      contradictory-feedback message, with an Ok button that resets to intro.

**Layout fix (from testing):** the guessing screen now renders a
[SecretBar](../src/mastermind/components/SecretBar.tsx) (the human's secret, shown openly)
on top, then the computer's guessed rows with their colors, then the
[FeedbackPicker](../src/mastermind/components/FeedbackPicker.tsx) as its own block **below**
the board. (Previously the picker was nested inside the 62px `.board-row`, which squashed
the guess pegs and floated the 400px picker box.)

### P2.8 — Polish

- [x] Brief "thinking" delay before each computer guess is revealed; scoring is withheld
      until it appears ([AlgorithmBoard](../src/mastermind/components/AlgorithmBoard.tsx)).
- [ ] **Styling pass** for the setup / guessing / feedback interfaces — deferred; the
      screens are functional but need a couple of visual passes to land where we want.

### P2.9 — Docs ✅

- [x] Updated [Overview.md](Overview.md): both modes, the algorithm-mode flow + `solver.ts`,
      the extended state machine, the `mode` field, the new actions, and the new components.
      (Removed the stale "reverse mode not yet implemented" note.)
