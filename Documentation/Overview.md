# Mastermind — Application Overview

This document describes what the application does and how it is built. It is intended
as an orientation for anyone (human or agent) coming to the codebase for the first time.

## What the app is

Mastermind is a single-page React app, built with [Vite](https://vitejs.dev), of the
classic code-breaking board game. The player takes the role of the **code breaker**:
the app secretly generates a 4-color code and the player has 10 attempts to guess it,
using feedback after each guess to narrow down the answer.

> Note: a planned reverse mode — where the computer guesses a code the user sets — is
> described in [Todo.md](Todo.md) but is **not yet implemented**. This document covers
> the current behavior only.

## Rules as implemented

- The secret code is **4 colors** drawn from a pool of **8** (`yellow`, `green`,
  `pink`, `silver`, `blue`, `white`, `red`, `orange`).
- The generated secret code uses each color **at most once** (colors are drawn without
  replacement — see [secretCode.js](../src/mastermind/reducers/secretCode.js)).
- The player has **10 attempts** (`NUM_ROWS`), one per board row.
- After submitting a row, feedback pegs are shown:
  - a **red** dot = right color in the right position,
  - a **white** dot = right color in the wrong position.
  - Feedback dots are not positional; reds are listed first, then whites, then blanks.
- The game ends when the player guesses all 4 positions correctly (**won**), runs out
  of rows (**lost**), or clicks **Give up**.

The in-app rules text is shown on the intro screen via the `Rules` component in
[Intro.jsx](../src/mastermind/components/Intro.jsx).

## How a game flows

1. **Intro screen.** The app starts in the `intro` game status, showing the title, a
   "Start game" button, and a toggle to show/hide the rules.
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

### State shape

A single state object holds the whole game (assembled in
[stateReducers.js](../src/mastermind/reducers/stateReducers.js)):

| Field            | Meaning                                                        |
|------------------|----------------------------------------------------------------|
| `board`          | Array of 10 rows; each row has `pegs[4]` and `feedback[4]`.     |
| `secretCode`     | The 4-color code to guess.                                     |
| `activeRow`      | Index of the row currently being filled.                       |
| `selectedPeg`    | Index of the hole the color picker is targeting.               |
| `showColorPicker`| Whether the color picker is open.                              |
| `gameStatus`     | `intro` / `playing` / `won` / `lost` / `gave_up`.              |
| `isCodeHidden`   | Whether the secret code is hidden from the player.             |
| `isRevealHidden` | Whether the reveal/give-up UI is hidden.                       |
| `isRulesHidden`  | Whether the intro rules text is collapsed.                     |

Peg/feedback values use the sentinels `'none'` (empty) and `'select'` (an empty,
selectable hole in the active row), otherwise a color name.

### Actions

Action types and action creators live in
[gameActions.js](../src/mastermind/gameActions.js). There are two layers:

- **High-level / user-facing actions** dispatched from the UI — e.g.
  `START_GAME`, `CHOOSE_COLOR_AND_ADVANCE`, `SUBMIT_ROW`, `GIVE_UP`, `RESET_ALL`,
  `TOGGLE_RULES`, `SHOW_COLOR_PICKER`.
- **Low-level / internal actions** that the root reducer expands the high-level ones
  into — e.g. `RANDOMIZE_SECRET_CODE`, `GAME_BEGIN`, `GIVE_FEEDBACK`,
  `BEGIN_NEW_ROW`, `REVEAL_SECRET_CODE`, `GAME_WIN`/`GAME_LOSE`, `CHOSE_THIS_COLOR`,
  `ADVANCE_SELECTOR`.

### Reducers

- [reducers/index.js](../src/mastermind/reducers/index.js) — the **root reducer**. It
  translates each high-level action into an ordered sequence of low-level actions and
  threads state through them. For example, `SUBMIT_ROW` runs `GIVE_FEEDBACK`, then
  `HIDE_COLOR_PICKER`, then decides between win / new-row / lose. This is where the core
  game logic lives.
- [reducers/stateReducers.js](../src/mastermind/reducers/stateReducers.js) — a set of
  small per-field reducers combined by `reduceSingleAction`, which applies one low-level
  action to the full state.
- [reducers/board.js](../src/mastermind/reducers/board.js) — maps actions over the rows,
  tagging the active row.
- [reducers/row.js](../src/mastermind/reducers/row.js) — updates a single row's pegs and
  feedback; contains `calculateFeedback`, which computes the red/white dots.
- [reducers/secretCode.js](../src/mastermind/reducers/secretCode.js) — generates a random
  4-color code by drawing without replacement.

### Components

The view layer is presentational and driven entirely by props passed down from
[App.jsx](../src/mastermind/App.jsx):

- [App.jsx](../src/mastermind/App.jsx) — wires state to handlers (each handler dispatches
  an action) and switches between the intro and gameplay screens.
- [components/Intro.jsx](../src/mastermind/components/Intro.jsx) — title screen + rules.
- [components/Gameplay.jsx](../src/mastermind/components/Gameplay.jsx) — renders the
  hidden code, the 10 board rows, and the give-up button.
- [components/BoardRow.jsx](../src/mastermind/components/BoardRow.jsx) — one row of pegs
  plus its feedback, and the per-row overlays (color picker, won/lost/gave-up messages).
- Supporting view pieces: `Peg`, `Hole`, `ColorPicker`, `Feedback`,
  `SmallFeedbackPeg`/`SmallFeedbackHole`, `HiddenCode`, `Won`, `Lost`, `Gaveup`,
  `Checkmark`, and the illustration pegs `PegIllu` / `PegSideways`.

### State entry point and persistence

[main.jsx](../src/mastermind/main.jsx) mounts the app. It initializes state from
`sessionStorage` (falling back to the reducer's initial state) and saves the full state
back to `sessionStorage` on every change via a `useEffect`. The storage helpers
(`loadState`, `saveState`, `clearState`, key `mastermind-state`) live in
[script/sessionStorage.js](../src/mastermind/script/sessionStorage.js). Because it uses
session storage, a game survives a page reload but not closing the tab.

### Constants and styling

- [script/constants.js](../src/mastermind/script/constants.js) — the color pool, board
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
| `npm run check`    | Run tests and then build (the CI-style gate).    |

Tests live alongside the code (e.g.
[reducers/reducer.test.js](../src/mastermind/reducers/reducer.test.js),
[gameActions.test.js](../src/mastermind/gameActions.test.js),
[App.test.jsx](../src/mastermind/App.test.jsx)) and are run with
[Vitest](https://vitest.dev) + React Testing Library in a jsdom environment.
