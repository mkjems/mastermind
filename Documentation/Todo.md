# TODO - this is where we decide and describe the next steps we will make.

### P1 - Improve architecture of this application

The current architecture is clean and well-tested, but several patterns will become
painful as the app grows (notably when the "Play against algorithm" mode below is added,
which roughly doubles the state-machine complexity). The items below are listed in the
order we should implement them — driven by dependencies and risk, not raw severity. The
first four are worth completing before starting the algorithm mode.

#### 1. Compute derived state, and make feedback correct in the general case

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

#### 2. Make the combined reducers truly independent

**Problem.** In [stateReducers.js](../src/mastermind/reducers/stateReducers.js),
`reduceSingleAction` computes `activeRow`, `selectedPeg`, and `secretCode` first and then
_passes them into_ `boardReducer`. So the board reducer depends on the freshly-computed
output of its sibling reducers within the same tick — a hidden ordering dependency, which
is exactly what `combineReducers` is designed to forbid. Reordering those lines silently
breaks the board.

**Why second.** Isolated cleanup that removes the hidden coupling and makes reasoning about
the next two steps much easier.

**Fix.**

- [ ] Remove the cross-reducer arguments. Each slice reducer should depend only on its own
      previous state and the action.
- [ ] If the board genuinely needs `activeRow`/`selectedPeg`/`secretCode`, carry those
      values _on the action payload_ (set by the action creator) rather than reading another
      slice's just-computed result.

#### 3. Model the game as an explicit finite state machine

**Problem.** `gameStatus` (intro / playing / won / lost / gave_up) and its transitions are
a textbook state machine, but the state is spread across several independent boolean
reducers (`isCodeHidden`, `isRevealHidden`, `showColorPicker`, `gameStatus`) that must be
kept mutually consistent by hand. That is why winning has to separately fire `GAME_WIN`
_and_ `REVEAL_SECRET_CODE`, and why illegal combinations (e.g. "won but code still hidden")
are representable at all.

**Why third.** It is the foundation for item 4 — the orchestration cleanup routes through
this machine, so the machine has to exist first. Together with item 4 this is really one
piece of work.

**Fix.**

- [ ] Introduce a single explicit machine — either a hand-rolled `{ state: { on: { EVENT:
    nextState } } }` transition map or a small library (e.g. XState).
- [ ] Derive the booleans (`isCodeHidden`, `isRevealHidden`, etc.) _from_ the current state
      instead of storing them, so illegal states become unrepresentable.

#### 4. Stop orchestrating sequences of actions inside the root reducer

**Problem.** [reducers/index.js](../src/mastermind/reducers/index.js) takes one high-level
action and manually runs a _sequence_ of low-level actions through `reduceSingleAction`,
threading state between them (e.g. `SUBMIT_ROW` chains `GIVE_FEEDBACK` → `HIDE_COLOR_PICKER`
→ a win/lose decision). A reducer is meant to be a pure `(state, action) → state` with no
orchestration. The result is that the core game logic ("did they win?", "is this the last
row?") lives in an action-expansion layer, which is the least obvious place to look for it.

**Why fourth.** This cannot be finished cleanly without the state machine from item 3; do
it immediately after, as part of the same effort.

**Fix.**

- [ ] Decide each game outcome _before_ dispatching, in the action layer, and dispatch a
      single descriptive action (e.g. `ROW_SUBMITTED` carrying the computed feedback and
      resulting status), or
- [ ] Replace the hand-rolled expansion with the explicit state machine from item 3, so
      transitions are declared in one place rather than sequenced imperatively.
- [ ] Keep reducers to a single action → single state-update; no calling a reducer from
      inside another reducer.

#### 5. Replace blanket prop-drilling with context (or explicit props)

**Problem.** [App.jsx](../src/mastermind/App.jsx) builds one large props object that is
`{...props}`-spread through [Gameplay.jsx](../src/mastermind/components/Gameplay.jsx) into
[BoardRow.jsx](../src/mastermind/components/BoardRow.jsx) and on into its children. You
cannot tell what a component actually consumes without reading its body, and every
component is coupled to the full state shape.

**Why fifth.** Independent of the reducer work, but worth doing before the algorithm mode,
which adds new components to wire in.

**Fix.**

- [ ] Provide `state` / `dispatch` via a small React context, or
- [ ] Pass explicit, named props to each component (no blanket spreads).
- [ ] Either approach makes the upcoming algorithm mode much easier to wire in.

#### 6. Replace overloaded sentinel strings and add type safety

**Problem.** Peg slots hold `'none'`, `'select'`, and color names in the same field
([row.js](../src/mastermind/reducers/row.js)), overloading one value with three meanings.
There are no types to catch a mismatched sentinel or a bad action shape.

**Why sixth.** Adopting TypeScript is disruptive. Either commit to it *first of all* (so
every later edit is type-checked) or do it *last* (type stable code rather than code you
are about to move) — don't sandwich it between the refactors. Listed last here on the
assumption we'd rather not block the refactors on a big-bang migration.

**Fix.**

- [ ] Represent a hole as a discriminated shape (e.g. `{ filled: false, selectable: bool }`
      vs `{ filled: true, color }`) instead of a magic string.
- [ ] Adopt TypeScript (at least for the reducers and action creators); given the reducer
      indirection it will pay for itself quickly.

#### 7. (Minor) Don't persist the secret code in a readable form

**Problem.** The full state, including `secretCode`, is saved to `sessionStorage`, so the
answer is trivially readable in devtools — a cheat vector for a guessing game.

**Why last.** Trivial and optional; only matters if cheating is a concern.

**Fix.**

- [ ] Either omit the secret from persisted state (and accept losing it on reload), or
      obfuscate it. Low priority — only matters if cheating is a concern.

### P5 - Add a button on the main page that says 'Play against algorithm' -

Goal: The idea is to reverse the roles, so that it will be the computer (algorithm) that does the guessing and the

- [ ] There should we a nice interface where user can set a secret code.
- [ ] The algorithm should then start guessing the code filling up a row of the board at a time
- [ ] User should then have a nice interface to provide feedback.
- [ ] That process should loop until the computer has guessed the code.
