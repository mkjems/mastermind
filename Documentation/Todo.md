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

#### P2.2 — Mode selection + state shape

- [ ] Add `mode: 'human' | 'algorithm'` to [types.ts](../src/mastermind/types.ts) and the
      initial state.
- [ ] Intro screen: add a second button "Play against algorithm" beside "Start game".
- [ ] New action (`START_ALGORITHM`) wired to the button; routes into the algorithm setup
      state (placeholder screen for now).
- [ ] Tests: the new action sets `mode` and the setup status.

#### P2.3 — State machine for algorithm mode

- [ ] Add statuses `algo_setup`, `algo_guessing`, `algo_solved`, `algo_failed` and events
      (`START_ALGORITHM`, `CONFIRM_SECRET`, `SUBMIT_FEEDBACK`; reuse `RESET` → intro) to
      [gameStatus.ts](../src/mastermind/gameStatus.ts).
- [ ] Extend selectors as needed (e.g. `isGameOver` covers the algo end states).
- [ ] Tests for the new transitions and ignored illegal events.

#### P2.4 — Secret-setup interface

- [ ] Component for the human to choose a 4-color secret (reuse `ColorPicker` / the
      peg-selection flow) with a confirm button; validate the secret is complete first.
- [ ] `CONFIRM_SECRET` reducer: store the secret, go to `algo_guessing`, and place the
      computer's first guess (`nextGuess`) on row 0.

#### P2.5 — Guess/feedback loop (reducer ↔ solver)

- [ ] `SUBMIT_FEEDBACK` reducer: record the human's feedback on the active row; if all-red
      → `algo_solved`; else derive `nextGuess` from board history and place it on the next
      row; if rows run out or no codes remain → `algo_failed`.
- [ ] Keep candidate derivation pure (from the board rows) — no stored candidate set.
- [ ] Tests: drive a full game by feeding feedback and assert the computer solves it;
      assert the failure paths.

#### P2.6 — Feedback input UI

Interaction (mirrors the color picker's fill-and-advance flow): the human scores the
computer's guess one feedback slot at a time, left to right, with an active-slot indicator.
The active slot offers three choices — **red**, **white**, or **✗ (done)**:

- Red or white fills the slot and advances to the next slot.
- ✗ finalizes scoring: the remaining slots stay empty (`none`) and the solver continues.
- Filling all four slots finalizes automatically (no ✗ needed).
- Reds/whites may be entered in any order — only the counts matter. So "all wrong" is just
  ✗ on the first slot; "2 red, 1 white" is red → red → white → ✗.

- [ ] Feedback-picker component reusing `SmallFeedbackPeg` (red/white) plus an ✗/none
      option, with the active-slot selector styled like the color picker.
- [ ] On finalize, dispatch `SUBMIT_FEEDBACK` with the scored row.
- [ ] (Per decision 1) validate the finalized feedback against the set secret; on mismatch,
      warn and let the human re-score rather than feeding the solver a wrong score.

#### P2.7 — Result + reset

- [ ] "The computer cracked it in N guesses" screen and a failure / contradictory-feedback
      screen (reuse the `Won`/`Lost` message pattern); reset → intro.

#### P2.8 — Polish (optional)

- [ ] Brief delay/animation when the computer places a guess; disable inputs while it
      "thinks"; styling pass for the setup and feedback interfaces.

#### P2.9 — Docs

- [ ] Update [Overview.md](Overview.md): the two modes, the `solver.ts` module, the
      extended state machine, and the new components.
