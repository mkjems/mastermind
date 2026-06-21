import React, { useEffect, useState } from "react";

import { useGame } from "../GameContext";
import { calculateFeedback } from "../reducers/row";
import {
  GAME_STATUS_ALGO_FAILED,
  GAME_STATUS_ALGO_SETUP,
  GAME_STATUS_ALGO_SOLVED,
} from "../gameStatus";
import Board from "./Board";
import Overlay from "./Overlay";
import FeedbackPicker from "./FeedbackPicker";
import SecretSetup from "./SecretSetup";
import type { Color, FeedbackPeg } from "../types";

const THINKING_MS = 700;
const FEEDBACK_LENGTH = 4;

const countOf = (pegs: FeedbackPeg[], peg: FeedbackPeg): number =>
  pegs.filter((value) => value === peg).length;

const padFeedback = (pegs: FeedbackPeg[]): FeedbackPeg[] => [
  ...pegs,
  ...Array<FeedbackPeg>(FEEDBACK_LENGTH - pegs.length).fill("none"),
];

// Algorithm mode through the shared Board: the human's secret sits (covered) at the
// bottom and the computer's guesses build upward from there. The player scores the
// active guess with the buttons just above it — the score shows live as red/white
// dots on the guess row — and a Peek button beside the secret briefly lifts its
// cover. Setup is delegated to SecretSetup (also rendered through Board).
const AlgorithmGame = () => {
  const {
    gameStatus,
    board,
    activeRow,
    secretCode,
    onSubmitFeedback,
    onResetAll,
  } = useGame();
  const [peeking, setPeeking] = useState(false);
  const [ready, setReady] = useState(false);
  const [entered, setEntered] = useState<FeedbackPeg[]>([]);
  const [error, setError] = useState(false);

  // Each new guess gets a short "thinking" beat, then a fresh, empty score.
  useEffect(() => {
    setReady(false);
    setEntered([]);
    setError(false);
    setPeeking(false);
    const timer = setTimeout(() => setReady(true), THINKING_MS);
    return () => clearTimeout(timer);
  }, [activeRow]);

  const exitBar = (
    <div className="exit-bar">
      <button onClick={onResetAll}>Exit game</button>
    </div>
  );

  if (gameStatus === GAME_STATUS_ALGO_SETUP) {
    return (
      <>
        {exitBar}
        <SecretSetup />
      </>
    );
  }

  const over =
    gameStatus === GAME_STATUS_ALGO_SOLVED ||
    gameStatus === GAME_STATUS_ALGO_FAILED;
  const showGuess = over || ready;
  const revealedRows = showGuess ? activeRow + 1 : activeRow;
  const coverState = over ? "open" : peeking ? "peek" : "closed";

  // Score the active guess. Validate against the secret the human set so the solver
  // never gets a wrong number — a mismatch warns and clears so they can re-score.
  const finalize = (pegs: FeedbackPeg[]) => {
    const padded = padFeedback(pegs);
    const truth = calculateFeedback(secretCode, board[activeRow].pegs);
    const matches =
      countOf(padded, "red") === countOf(truth, "red") &&
      countOf(padded, "white") === countOf(truth, "white");
    if (!matches) {
      setError(true);
      setEntered([]);
      return;
    }
    onSubmitFeedback(padded);
  };

  const place = (peg: FeedbackPeg) => {
    if (entered.length >= FEEDBACK_LENGTH) {
      return;
    }
    setError(false);
    setEntered((current) =>
      current.length >= FEEDBACK_LENGTH ? current : [...current, peg],
    );
  };

  const undo = () => {
    setError(false);
    setEntered((current) => current.slice(0, -1));
  };

  const scoring = !over && ready;

  const activeRowExtra = scoring ? (
    <FeedbackPicker
      onPlace={place}
      onFinalize={() => finalize(entered)}
      onUndo={undo}
      canPlace={entered.length < FEEDBACK_LENGTH}
      canUndo={entered.length > 0}
      error={error}
    />
  ) : null;

  const coverAction = over ? null : (
    <button className="secret-peek" onClick={() => setPeeking((p) => !p)}>
      {peeking ? "Hide" : "Peek"}
    </button>
  );

  const footer = !over && !ready ? <p>The computer is thinking…</p> : null;

  let overlay: React.ReactNode = null;
  if (over) {
    const solved = gameStatus === GAME_STATUS_ALGO_SOLVED;
    overlay = (
      <Overlay>
        {solved ? (
          <p>The computer cracked your code in {activeRow + 1} guesses!</p>
        ) : (
          <p>
            The computer couldn&apos;t crack it — the feedback was inconsistent.
          </p>
        )}
        <button onClick={onResetAll}>Ok</button>
      </Overlay>
    );
  }

  return (
    <>
      {!over && exitBar}
      <Board
        orientation="bottom-up"
        showCover
        coverState={coverState}
        revealedRows={revealedRows}
        interactive={false}
        liveFeedback={scoring ? padFeedback(entered) : undefined}
        activeRowExtra={activeRowExtra}
        coverAction={coverAction}
        footer={footer}
        overlay={overlay}
      />
    </>
  );
};

export default AlgorithmGame;
