import React, { useEffect, useState } from "react";

import { useGame } from "../GameContext";
import Peg from "./Peg";
import Feedback from "./Feedback";
import FeedbackPicker from "./FeedbackPicker";
import SecretBar from "./SecretBar";
import type { Color } from "../types";

const THINKING_MS = 700;

// Algorithm mode play: the human's secret on top, then the computer's guesses
// filling the board top-down. Each new guess gets a brief "thinking" beat before
// it appears, and scoring is withheld until it does.
const AlgorithmBoard = () => {
  const { board, activeRow } = useGame();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(false);
    const timer = setTimeout(() => setReady(true), THINKING_MS);
    return () => clearTimeout(timer);
  }, [activeRow]);

  return (
    <div>
      <SecretBar />

      <p className="board" style={{ textAlign: "center" }}>
        Score each guess: red = right color &amp; place, white = right color
        only.
      </p>

      {board.slice(0, activeRow).map((row, index) => (
        <div className="board" key={index}>
          <div className="board-row">
            {row.pegs.map((peg, pegIndex) => (
              <Peg key={pegIndex} id={pegIndex} peg={peg} />
            ))}
            <Feedback feedbackPegs={row.feedback} />
          </div>
        </div>
      ))}

      {ready ? (
        <>
          <div className="board">
            <div className="board-row" style={{ outline: "2px solid #888" }}>
              {board[activeRow].pegs.map((peg, pegIndex) => (
                <Peg key={pegIndex} id={pegIndex} peg={peg} />
              ))}
            </div>
          </div>
          <FeedbackPicker
            key={activeRow}
            guess={board[activeRow].pegs as Color[]}
          />
        </>
      ) : (
        <p className="board" style={{ textAlign: "center" }}>
          The computer is thinking…
        </p>
      )}
    </div>
  );
};

export default AlgorithmBoard;
