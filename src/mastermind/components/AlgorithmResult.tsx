import React from "react";

import { useGame } from "../GameContext";
import { GAME_STATUS_ALGO_SOLVED } from "../gameStatus";
import Peg from "./Peg";
import Feedback from "./Feedback";
import SecretBar from "./SecretBar";

const AlgorithmResult = () => {
  const { gameStatus, activeRow, board, onResetAll } = useGame();
  const solved = gameStatus === GAME_STATUS_ALGO_SOLVED;

  return (
    <div>
      <SecretBar />

      {board.slice(0, activeRow + 1).map((row, index) => (
        <div className="board" key={index}>
          <div className="board-row">
            {row.pegs.map((peg, pegIndex) => (
              <Peg key={pegIndex} id={pegIndex} peg={peg} />
            ))}
            <Feedback feedbackPegs={row.feedback} />
          </div>
        </div>
      ))}

      <div className="board statusMessages">
        {solved ? (
          <p>The computer cracked your code in {activeRow + 1} guesses!</p>
        ) : (
          <p>
            The computer couldn&apos;t crack it — the feedback was inconsistent.
          </p>
        )}
        <button onClick={onResetAll}>Ok</button>
      </div>
    </div>
  );
};

export default AlgorithmResult;
