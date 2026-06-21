import React from "react";

import { useGame } from "../GameContext";
import HiddenCode from "./HiddenCode";
import BoardRow from "./BoardRow";
import BoardRidge from "./BoardRidge";
import { GameMode } from "../types";

const Gameplay = () => {
  const { board, activeRow, canGiveUp, onGiveUp, mode } = useGame();
  return (
    <BoardRidge>
      {mode === GameMode.HUMAN ? <HiddenCode /> : null}

      {board.map((row, index) => {
        return (
          <BoardRow
            key={index}
            pegs={row.pegs}
            feedbackPegs={row.feedback}
            isActiveRow={activeRow === index}
          />
        );
      })}

      {mode === GameMode.ALGORITHM ? <HiddenCode /> : null}

      <div className="bottom-part">
        {canGiveUp ? <button onClick={onGiveUp}>Give up</button> : null}
      </div>
    </BoardRidge>
  );
};

export default Gameplay;
