# TODO - this is where we decide and describe the next steps we will make.

### P1 - Improve architecture of this application

The current architecture is clean and well-tested, but several patterns will become
painful as the app grows (notably when the "Play against algorithm" mode below is added,
which roughly doubles the state-machine complexity). The items below are numbered by
severity, but that is not the order to implement them in.

**Suggested work order** (driven by dependencies and risk):

1. **#5 — fix feedback / derive win-lose.** Small, isolated, a correctness fix rather than
   a refactor. The algorithm mode consumes feedback to pick its next guess, so a correct
   `calculateFeedback` is a prerequisite for that work.
2. **#2 — reducer independence.** Isolated cleanup that removes the hidden coupling and
   makes reasoning about the next two steps easier.
3. **#3 then #1 — state machine, then remove orchestration.** These are really one task:
   define the explicit machine first, then route submission/orchestration through it and
   delete the hand-rolled sequencing. #1 cannot be finished cleanly without #3.
4. **#6 — prop-drilling.** Worth doing before the algorithm mode, which adds new components
   to wire in.
5. **#4 — TypeScript.** The disruptive one. Either commit to it *first of all* (so every
   later edit is type-checked) or do it *last* (type stable code rather than code you are
   about to move). Don't sandwich it between the refactors.
6. **#7 — persist secret (optional).** Trivial; only if cheating is a concern.

The "first three before the algorithm mode" guidance still holds — the right three are
#5, #2, and #3+#1.

#### 1. Stop orchestrating sequences of actions inside the root reducer

**Problem.** [reducers/index.js](../src/mastermind/reducers/index.js) takes one high-level
action and manually runs a _sequence_ of low-level actions through `reduceSingleAction`,
threading state between them (e.g. `SUBMIT_ROW` chains `GIVE_FEEDBACK` → `HIDE_COLOR_PICKER`
→ a win/lose decision). A reducer is meant to be a pure `(state, action) → state` with no
orchestration. The result is that the core game logic ("did they win?", "is this the last
row?") lives in an action-expansion layer, which is the least obvious place to look for it.

**Fix.**

- [ ] Decide each game outcome _before_ dispatching, in the action layer, and dispatch a
      single descriptive action (e.g. `ROW_SUBMITTED` carrying the computed feedback and
      resulting status), or
- [ ] Replace the hand-rolled expansion with the explicit state machine from item 3, so
      transitions are declared in one place rather than sequenced imperatively.
- [ ] Keep reducers to a single action → single state-update; no calling a reducer from
      inside another reducer.

#### 2. Make the combined reducers truly independent

**Problem.** In [stateReducers.js](../src/mastermind/reducers/stateReducers.js),
`reduceSingleAction` computes `activeRow`, `selectedPeg`, and `secretCode` first and then
_passes them into_ `boardReducer`. So the board reducer depends on the freshly-computed
output of its sibling reducers within the same tick — a hidden ordering dependency, which
is exactly what `combineReducers` is designed to forbid. Reordering those lines silently
breaks the board.

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

**Fix.**

- [ ] Introduce a single explicit machine — either a hand-rolled `{ state: { on: { EVENT:
    nextState } } }` transition map or a small library (e.g. XState).
- [ ] Derive the booleans (`isCodeHidden`, `isRevealHidden`, etc.) _from_ the current state
      instead of storing them, so illegal states become unrepresentable.

#### 4. Replace overloaded sentinel strings and add type safety

**Problem.** Peg slots hold `'none'`, `'select'`, and color names in the same field
([row.js](../src/mastermind/reducers/row.js)), overloading one value with three meanings.
There are no types to catch a mismatched sentinel or a bad action shape.

**Fix.**

- [ ] Represent a hole as a discriminated shape (e.g. `{ filled: false, selectable: bool }`
      vs `{ filled: true, color }`) instead of a magic string.
- [ ] Adopt TypeScript (at least for the reducers and action creators); given the reducer
      indirection it will pay for itself quickly.

#### 5. Compute derived state, and make feedback correct in the general case

**Problem.** Whether the player won is recomputed and stored. `calculateFeedback` uses
`answer.includes(color)` ([row.js:13](../src/mastermind/reducers/row.js#L13)), which only
produces correct white counts because the secret currently has unique colors. It silently
miscounts if duplicate colors are ever allowed.

**Fix.**

- [ ] Derive win/lose from the board + feedback rather than storing it.
- [ ] Rewrite `calculateFeedback` to be correct for codes with duplicate colors (the
      standard two-pass count: exact matches first, then match remaining by color counts),
      so a future rules change cannot quietly corrupt feedback. Add tests for the duplicate
      case.

#### 6. Replace blanket prop-drilling with context (or explicit props)

**Problem.** [App.jsx](../src/mastermind/App.jsx) builds one large props object that is
`{...props}`-spread through [Gameplay.jsx](../src/mastermind/components/Gameplay.jsx) into
[BoardRow.jsx](../src/mastermind/components/BoardRow.jsx) and on into its children. You
cannot tell what a component actually consumes without reading its body, and every
component is coupled to the full state shape.

**Fix.**

- [ ] Provide `state` / `dispatch` via a small React context, or
- [ ] Pass explicit, named props to each component (no blanket spreads).
- [ ] Either approach makes the upcoming algorithm mode much easier to wire in.

#### 7. (Minor) Don't persist the secret code in a readable form

**Problem.** The full state, including `secretCode`, is saved to `sessionStorage`, so the
answer is trivially readable in devtools — a cheat vector for a guessing game.

**Fix.**

- [ ] Either omit the secret from persisted state (and accept losing it on reload), or
      obfuscate it. Low priority — only matters if cheating is a concern.

### P5 - Add a button on the main page that says 'Play against algorithm' -

Goal: The idea is to reverse the roles, so that it will be the computer (algorithm) that does the guessing and the

- [ ] There should we a nice interface where user can set a secret code.
- [ ] The algorithm should then start guessing the code filling up a row of the board at a time
- [ ] User should then have a nice interface to provide feedback.
- [ ] That process should loop until the computer has guessed the code.
