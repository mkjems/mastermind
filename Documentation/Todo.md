# TODO - this is where we decide and describe the next steps we will make.

### P2 - Add a button on the main page that says 'Play against algorithm' -

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

#### P2.1 — Solver core (pure + tested) ✅

- [x] [solver.ts](../src/mastermind/solver.ts): `allCodes()` (the 1680 unique-color
      permutations); `consistentCodes(history)` keeping codes where
      `calculateFeedback(candidate, guess)` matches the recorded reds/whites for every past
      (guess, feedback); `nextGuess(history)` returning the first consistent code.
- [x] `nextGuess` returns `undefined` when no code is consistent (contradictory feedback).
- [x] Tests in [solver.test.ts](../src/mastermind/solver.test.ts): `allCodes` shape,
      filtering correctness, contradictory feedback → empty, and a solve loop.
- Note: a full sweep over all 1680 secrets showed **worst case 7 guesses, avg 4.9** — so
  "first consistent candidate" always solves within the 10-row board; minimax not needed.

#### P2.2 — Mode selection + state shape ✅

- [x] Added `mode: 'human' | 'algorithm'` ([types.ts](../src/mastermind/types.ts)) with a
      `modeReducer` and initial value `'human'`; `START_ALGORITHM` → algorithm, `START_GAME`
      / `RESET_ALL` → human. `mode` is on `GameContextValue`.
- [x] Intro screen: added a "Play against algorithm" button beside "Start game".
- [x] `START_ALGORITHM` action + creator wired to the button; App routes algorithm-mode
      statuses to a placeholder [AlgorithmGame](../src/mastermind/components/AlgorithmGame.tsx).
- [x] Tests: the action sets `mode` + `algo_setup`, and reset returns to human/intro.

#### P2.3 — State machine for algorithm mode ✅

- [x] Added statuses `algo_setup`, `algo_guessing`, `algo_solved`, `algo_failed` and events
      `START_ALGORITHM`, `CONFIRM_SECRET`, `SOLVED`, `FAILED` to
      [gameStatus.ts](../src/mastermind/gameStatus.ts); `RESET` → intro still applies. (The
      `CONFIRM_SECRET`/`SOLVED`/`FAILED` transitions exist now; their driving actions land in
      P2.4/P2.5.)
- [x] `isGameOver` now covers `algo_solved`/`algo_failed`.
- [x] Tests for the algorithm transitions and ignored illegal events.

#### P2.4 — Secret-setup interface ✅

- [x] [SecretSetup.tsx](../src/mastermind/components/SecretSetup.tsx): pick 4 colors from a
      `PegIllu` palette that disables already-used colors (codes never repeat a color);
      "Let the computer guess" is enabled only once 4 are chosen.
- [x] `CONFIRM_SECRET` reducer: stores the secret, transitions to `algo_guessing`, and
      places the computer's opening guess (`nextGuess([])`) on row 0.

#### P2.5 — Guess/feedback loop (reducer ↔ solver) ✅

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

#### P2.6 — Feedback input UI

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

#### P2.7 — Result + reset ✅

- [x] [AlgorithmResult](../src/mastermind/components/AlgorithmResult.tsx) shows the secret
      bar + the full guess history + a "cracked it in N guesses" or
      contradictory-feedback message, with an Ok button that resets to intro.

**Layout fix (from testing):** the guessing screen now renders a
[SecretBar](../src/mastermind/components/SecretBar.tsx) (the human's secret, shown openly)
on top, then the computer's guessed rows with their colors, then the
[FeedbackPicker](../src/mastermind/components/FeedbackPicker.tsx) as its own block **below**
the board. (Previously the picker was nested inside the 62px `.board-row`, which squashed
the guess pegs and floated the 400px picker box.)

#### P2.8 — Polish

- [x] Brief "thinking" delay before each computer guess is revealed; scoring is withheld
      until it appears ([AlgorithmBoard](../src/mastermind/components/AlgorithmBoard.tsx)).
- [ ] **Styling pass** for the setup / guessing / feedback interfaces — deferred; the
      screens are functional but need a couple of visual passes to land where we want.

#### P2.9 — Docs ✅

- [x] Updated [Overview.md](Overview.md): both modes, the algorithm-mode flow + `solver.ts`,
      the extended state machine, the `mode` field, the new actions, and the new components.
      (Removed the stale "reverse mode not yet implemented" note.)
