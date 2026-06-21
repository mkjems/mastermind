import React, { useEffect, useState } from "react";

import { useGame } from "../GameContext";
import {
  GAME_STATUS_ALGO_FAILED,
  GAME_STATUS_ALGO_SETUP,
  GAME_STATUS_ALGO_SOLVED,
} from "../gameStatus";
import Board from "./Board";
import Overlay from "./Overlay";
import FeedbackPicker from "./FeedbackPicker";
import SecretSetup from "./SecretSetup";
import type { Color } from "../types";

const THINKING_MS = 700;

// Algorithm mode through the shared Board: the human's secret sits (covered) at the
// bottom, and the computer's guesses build upward from there. The player scores the
// active guess in the footer; a Peek button briefly lifts the secret cover. Setup is
// delegated to SecretSetup (also rendered through Board).
const AlgorithmGame = () => {
  const { gameStatus, board, activeRow, onResetAll } = useGame();
  const [peeking, setPeeking] = useState(false);
  const [ready, setReady] = useState(false);

  // A short "thinking" beat before each freshly-computed guess is revealed.
  useEffect(() => {
    setReady(false);
    const timer = setTimeout(() => setReady(true), THINKING_MS);
    return () => clearTimeout(timer);
  }, [activeRow]);

  if (gameStatus === GAME_STATUS_ALGO_SETUP) {
    return <SecretSetup />;
  }

  const over =
    gameStatus === GAME_STATUS_ALGO_SOLVED ||
    gameStatus === GAME_STATUS_ALGO_FAILED;
  const showGuess = over || ready;
  const revealedRows = showGuess ? activeRow + 1 : activeRow;
  const coverState = over ? "open" : peeking ? "peek" : "closed";

  let footer: React.ReactNode = null;
  if (!over && !ready) {
    footer = <p>The computer is thinking…</p>;
  } else if (!over) {
    footer = (
      <>
        <FeedbackPicker
          key={activeRow}
          guess={board[activeRow].pegs as Color[]}
        />
        <button onClick={() => setPeeking((p) => !p)}>
          {peeking ? "Hide" : "Peek"}
        </button>
      </>
    );
  }

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
    <Board
      orientation="bottom-up"
      showCover
      coverState={coverState}
      revealedRows={revealedRows}
      interactive={false}
      footer={footer}
      overlay={overlay}
    />
  );
};

export default AlgorithmGame;
