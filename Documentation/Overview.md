# Mastermind — Application Overview

This document describes what the application does and how it is built. It is intended
as an orientation for anyone (human or agent) coming to the codebase for the first time.

## What the app is

Mastermind is a single-page React app, built with [Vite](https://vitejs.dev), of the
classic code-breaking board game. It has two modes, chosen on the intro screen:

- **Human mode** ("Start game") — the player is the **code breaker**: the app secretly
  generates a 4-color code and the player has 10 attempts to guess it, scoring feedback
  after each guess.
- **Algorithm mode** ("Play against algorithm") — the roles reverse. The **player sets a
  secret code** and the **computer guesses it**, one row at a time; the player scores each
  guess with red/white feedback until the computer cracks it. See
  [Algorithm mode](#algorithm-mode) below.

## Rules as implemented

- The secret code is **4 colors** drawn from a pool of **8** (`yellow`, `green`,
  `pink`, `silver`, `blue`, `white`, `red`, `orange`).
- The generated secret code uses each color **at most once** (colors are drawn without
  replacement — see [secretCode.ts](../src/mastermind/reducers/secretCode.ts)).
- The player has **10 attempts** (`NUM_ROWS`), one per board row.
- After submitting a row, feedback pegs are shown:
  - a **red** dot = right color in the right position,
  - a **white** dot = right color in the wrong position.
  - Feedback dots are not positional; reds are listed first, then whites, then blanks.
- The game ends when the player guesses all 4 positions correctly (**won**), runs out
  of rows (**lost**), or clicks **Give up**.

The in-app rules text is shown on the intro screen via the `Rules` component in
[Intro.tsx](../src/mastermind/components/Intro.tsx).

## How a game flows

This is the **human-mode** flow (algorithm mode is described [below](#algorithm-mode)).

1. **Intro screen.** The app starts in the `intro` game status, showing the title, a
   "Start game" button, a "Play against algorithm" button, and a toggle to show/hide the
   rules.
2. **Start.** Clicking "Start game" randomizes a fresh secret code and moves the status
   to `playing`. The board shows 10 rows; the first row is active with 4 selectable holes.
3. **Filling a row.** The player clicks a hole to open the **ColorPicker**, picks a
   color, and the selector advances to the next empty hole automatically. Once all 4
   holes in the active row are filled, the row can be submitted.
4. **Submitting.** On submit, feedback is calculated for the active row. Then:
   - if all 4 feedback pegs are red → status becomes `won` and the secret code is revealed;
   - else if rows remain → a new row becomes active and selectable;
   - else (last row used) → the secret code is revealed and status becomes `lost`.
5. **Give up.** While playing, the player can give up. The secret code is revealed and
   the status becomes `gave_up`.
6. **Reset.** Resetting returns to the intro screen, clears the board, generates a new
   secret code, and clears persisted state.

## Architecture

The app uses a **Redux-style reducer pattern** driven by React's `useReducer` — there is
no Redux dependency; it is hand-rolled with plain functions.

The entire `src/` tree is **TypeScript** (`.ts`/`.tsx`) — the domain (state, actions, the
status machine, reducers) and the React components are all typed, and `npm run check` runs
`tsc --noEmit` as part of the gate. Domain types live in
[types.ts](../src/mastermind/types.ts) (`Color`, `PegValue`, `FeedbackPeg`, `Row`, `Board`,
`GameState`). Vite, Vitest, and `tsc` (moduleResolution `bundler`) all resolve the existing
`.js`/`.jsx` import specifiers to the `.ts`/`.tsx` files, so imports didn't need rewriting.

### State shape

A single state object holds the whole game (assembled in
[stateReducers.ts](../src/mastermind/reducers/stateReducers.ts)):

| Field            | Meaning                                                        |
|------------------|----------------------------------------------------------------|
| `board`          | Array of 10 rows; each row has `pegs[4]` and `feedback[4]`.     |
| `secretCode`     | The 4-color code to guess.                                     |
| `activeRow`      | Index of the row currently being filled.                       |
| `selectedPeg`    | Index of the hole the color picker is targeting.               |
| `showColorPicker`| Whether the color picker is open.                              |
| `gameStatus`     | The machine state (human: `intro`/`playing`/`won`/`lost`/`gave_up`; algorithm: `algo_setup`/`algo_guessing`/`algo_solved`/`algo_failed`). |
| `isRulesHidden`  | Whether the intro rules text is collapsed.                     |
| `mode`           | `'human'` or `'algorithm'` — which game is being played.        |

In algorithm mode the fields are reused: `secretCode` holds the code the **player** set,
and each board row holds one of the **computer's** guesses (`pegs`) plus the feedback the
player scored for it (`feedback`).

Peg/feedback values use the sentinels `'none'` (empty) and `'select'` (an empty,
selectable hole in the active row), otherwise a color name.

Two view flags are **not stored** — they are derived from `gameStatus` by selectors in
[gameStatus.ts](../src/mastermind/gameStatus.ts) so they cannot drift out of sync:
`isCodeHidden(status)` (the code is hidden until the game is over) and `canGiveUp(status)`
(true only while `playing`). [App.tsx](../src/mastermind/App.tsx) computes them and passes
them down as props.

### Actions

Action types and creators live in [gameActions.ts](../src/mastermind/gameActions.ts).
There is a single layer of **user-facing actions** dispatched from the UI. Human mode:
`START_GAME`, `SHOW_COLOR_PICKER`, `CHOOSE_COLOR_AND_ADVANCE`, `SUBMIT_ROW`, `GIVE_UP`.
Algorithm mode: `START_ALGORITHM`, `CONFIRM_SECRET`, `SUBMIT_FEEDBACK`. Shared:
`RESET_ALL`, `TOGGLE_RULES` (plus `INIT`). Every slice reducer responds to these directly;
there is no internal/low-level action layer.

### The game state machine

Game status is an explicit finite state machine in
[gameStatus.ts](../src/mastermind/gameStatus.ts): a `TRANSITIONS` table keyed by
`status → event → nextStatus`, applied by `nextStatus(status, event)`. From `intro` the
two flows branch:

- Human: `START` → `playing`, then `WIN`/`LOSE`/`GIVE_UP` to the resolved states.
- Algorithm: `START_ALGORITHM` → `algo_setup`, `CONFIRM_SECRET` → `algo_guessing`, then
  `SOLVED`/`FAILED` to the resolved states.

Events that aren't valid for the current status are ignored (status unchanged); `RESET`
returns to `intro` from anywhere. This makes illegal states (e.g. "won but still playing")
unrepresentable.

### Reducers

- [reducers/index.ts](../src/mastermind/reducers/index.ts) — the **root reducer**, a
  single-pass composition of the slice reducers. A `decorateAction` step first enriches the
  action with context derived from the *previous* state (so no slice reducer reads
  another's freshly-computed output) and decides the submit outcome **once**: it computes
  the row's feedback and resolves it to a `WIN` / `LOSE` / continue event carried on the
  action. No action sequencing, no reducer calling another reducer.
- [reducers/stateReducers.ts](../src/mastermind/reducers/stateReducers.ts) — the small
  per-field reducers (`gameStatus`, `selectedPeg`, `activeRow`, `showColorPicker`,
  `isRulesHidden`). The status reducer maps the action to a machine event and runs it
  through `nextStatus`.
- [reducers/board.ts](../src/mastermind/reducers/board.ts) — updates the board rows in
  response to the high-level actions (place a color, write feedback and activate the next
  row on submit, reveal on give-up, reset).
- [reducers/row.ts](../src/mastermind/reducers/row.ts) — pure helpers only:
  `calculateFeedback` (the two-pass red/white dot count) and `isSolved`.
- [reducers/secretCode.ts](../src/mastermind/reducers/secretCode.ts) — generates a random
  4-color code by drawing without replacement.

### Components

The view layer is presentational. [App.tsx](../src/mastermind/App.tsx) puts the whole-game
view state and the action handlers into a [GameContext](../src/mastermind/GameContext.ts);
gameplay components read what they need with `useGame()`. Genuinely per-instance values (a
row's pegs/feedback, a peg's id) are passed as explicit props, and the small reusable leaf
components (`Peg`, `Feedback`, `Hole`, `Checkmark`) stay prop-driven.

- [App.tsx](../src/mastermind/App.tsx) — builds the context value (state-derived fields +
  handlers that dispatch actions) and switches between the intro and gameplay screens.
- [components/Intro.tsx](../src/mastermind/components/Intro.tsx) — title screen + rules.
- [components/Gameplay.tsx](../src/mastermind/components/Gameplay.tsx) — renders the
  hidden code, the 10 board rows, and the give-up button.
- [components/BoardRow.tsx](../src/mastermind/components/BoardRow.tsx) — one row of pegs
  plus its feedback, and the per-row overlays (color picker, won/lost/gave-up messages).
- Supporting view pieces: `Peg`, `Hole`, `ColorPicker`, `Feedback`,
  `SmallFeedbackPeg`/`SmallFeedbackHole`, `HiddenCode`, `Won`, `Lost`, `Gaveup`,
  `Checkmark`, and the illustration pegs `PegIllu` / `PegSideways`.

[App.tsx](../src/mastermind/App.tsx) renders `Intro` at the intro, otherwise switches on
`mode`: human mode → `Gameplay`, algorithm mode →
[AlgorithmGame](../src/mastermind/components/AlgorithmGame.tsx), which in turn routes by
status to [SecretSetup](../src/mastermind/components/SecretSetup.tsx),
[AlgorithmBoard](../src/mastermind/components/AlgorithmBoard.tsx) (with
[SecretBar](../src/mastermind/components/SecretBar.tsx) and
[FeedbackPicker](../src/mastermind/components/FeedbackPicker.tsx)), or
[AlgorithmResult](../src/mastermind/components/AlgorithmResult.tsx).

### Algorithm mode

The reverse game: the player sets the code and the computer breaks it.

1. **Setup.** [SecretSetup](../src/mastermind/components/SecretSetup.tsx) lets the player
   pick 4 distinct colors (the palette disables already-used colors). `CONFIRM_SECRET`
   stores them in `secretCode`, moves to `algo_guessing`, and places the computer's opening
   guess on row 0.
2. **Loop.** [AlgorithmBoard](../src/mastermind/components/AlgorithmBoard.tsx) shows the
   secret and the guesses so far; the player scores the active guess with
   [FeedbackPicker](../src/mastermind/components/FeedbackPicker.tsx) (red / white / ✗,
   fill-and-advance). `SUBMIT_FEEDBACK` records the score; in `decorateAction`
   ([reducers/index.ts](../src/mastermind/reducers/index.ts)) the outcome is decided once —
   all-red → `algo_solved`; otherwise the next guess is computed and placed on the next row,
   or `algo_failed` if no code is consistent or rows run out.

The brain is [solver.ts](../src/mastermind/solver.ts) — pure functions:

- `allCodes()` — the 1680 unique-color codes (8·7·6·5).
- `consistentCodes(history)` — the codes still possible, by keeping those that, treated as
  the secret, reproduce the recorded feedback for every past guess (reuses
  `calculateFeedback`, comparing red/white counts).
- `nextGuess(history)` — the first consistent code, or `undefined` (contradictory feedback).

The candidate set is **not stored** — it's derived from the board's (guess, feedback) rows
each turn. The "first consistent candidate" strategy solves every secret in **≤ 7 guesses**
(measured), well within the 10-row board, so no minimax is needed.

Two supporting touches: `FeedbackPicker` **validates** the player's score against the set
secret and warns on a mismatch (so the solver never gets a wrong number), and
`AlgorithmBoard` adds a short "thinking" delay before revealing each new guess.

### State entry point and persistence

[main.tsx](../src/mastermind/main.tsx) mounts the app. It initializes state from
`sessionStorage` (falling back to the reducer's initial state) and saves the full state
back to `sessionStorage` on every change via a `useEffect`. The storage helpers
(`loadState`, `saveState`, `clearState`, key `mastermind-state`) live in
[script/sessionStorage.js](../src/mastermind/script/sessionStorage.js). Because it uses
session storage, a game survives a page reload but not closing the tab.

### Constants and styling

- [script/constants.ts](../src/mastermind/script/constants.ts) — the color pool, board
  dimensions (`NUM_ROWS`), starting board/row shapes, and the color palettes used to
  render the 3D-looking pegs (`TOP_VIEW_COLORS`, `SIDEWAYS_COLORS`).
- [style/](../src/mastermind/style/) — `mastermind.css` and `colors.css`.

## Running and testing

From [package.json](../package.json):

| Command            | Purpose                                          |
|--------------------|--------------------------------------------------|
| `npm run dev`      | Start the Vite dev server.                       |
| `npm run build`    | Build the static production site.                |
| `npm run preview`  | Preview the production build.                    |
| `npm test`         | Run the Vitest test suite once.                  |
| `npm run test:watch`| Run Vitest in watch mode.                       |
| `npm run typecheck`| Type-check the codebase (`tsc --noEmit`).|
| `npm run check`    | Typecheck, then test, then build (the CI-style gate).|

Tests live alongside the code (e.g.
[reducers/reducer.test.js](../src/mastermind/reducers/reducer.test.js),
[gameActions.test.js](../src/mastermind/gameActions.test.js),
[App.test.tsx](../src/mastermind/App.test.tsx)) and are run with
[Vitest](https://vitest.dev) + React Testing Library in a jsdom environment.
