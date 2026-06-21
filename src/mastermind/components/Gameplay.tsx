import React from "react";

import { useGame } from "../GameContext";
import HiddenCode from "./HiddenCode";
import BoardRow from "./BoardRow";
import BoardRidge from "./BoardRidge";

const Gameplay = () => {
  const { board, activeRow, canGiveUp, onGiveUp } = useGame();
  return (
    <BoardRidge>
      <HiddenCode />

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

      <div className="bottom-part">
        {canGiveUp ? <button onClick={onGiveUp}>Give up</button> : null}
      </div>
    </BoardRidge>
  );
};

export default Gameplay;
