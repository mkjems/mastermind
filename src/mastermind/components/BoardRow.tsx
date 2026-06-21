import React from "react";

import { useGame } from "../GameContext";
import Peg from "./Peg";
import Feedback from "./Feedback";
import ColorPicker from "./ColorPicker";
import { GAME_STATUS_GAVE_UP } from "../gameStatus";
import type { FeedbackPeg, PegValue } from "../types";

interface BoardRowProps {
  pegs: PegValue[];
  feedbackPegs: FeedbackPeg[];
  isActiveRow: boolean;
}

const BoardRow = ({ pegs, feedbackPegs, isActiveRow }: BoardRowProps) => {
  const { onPegClick, gameStatus, showColorPicker, selectedPeg } = useGame();
  const gaveUp = gameStatus === GAME_STATUS_GAVE_UP;

  return (
    <>
      <div>
        <div className="board-row">
          {pegs.map((peg, index) => {
            const isSelected = isActiveRow && selectedPeg === index;
            return (
              <Peg
                isActiveRow={isActiveRow}
                isSelected={isSelected}
                key={index}
                id={index}
                peg={peg}
                onPegClick={isActiveRow && !gaveUp ? onPegClick : () => {}}
              />
            );
          })}
          <Feedback feedbackPegs={feedbackPegs} />
        </div>
      </div>
      {isActiveRow && showColorPicker ? <ColorPicker /> : null}
    </>
  );
};

export default BoardRow;
