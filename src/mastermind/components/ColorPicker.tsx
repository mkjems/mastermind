import React from "react";

import { SIDEWAYS_COLORS } from "../script/constants";
import { useGame } from "../GameContext";
import type { Color } from "../types";
import PegSideways from "./PegSideways";
import Checkmark from "./Checkmark";

const ColorPicker = () => {
  const { onChooseColor, onSubmitRow, isCompleteRow } = useGame();
  return (
    <div className="picker-box">
      {(Object.keys(SIDEWAYS_COLORS) as Color[]).map((name) => {
        const colors = SIDEWAYS_COLORS[name];
        return (
          <div
            key={name}
            className="picker-color"
            onClick={() => onChooseColor(name)}
          >
            <PegSideways colors={colors} />
          </div>
        );
      })}
      <div className="picker-color"></div>
      <Checkmark onSubmitRow={onSubmitRow} isActive={isCompleteRow} />
    </div>
  );
};

export default ColorPicker;
