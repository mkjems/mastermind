import React from "react";

import { SIDEWAYS_COLORS } from "../script/constants";
import { useGame } from "../GameContext";
import type { Color } from "../types";
import PegSideways from "./PegSideways";
import Checkmark from "./Checkmark";

interface ColorPickerProps {
  // Handlers default to the human-game context so existing callers need no props.
  // The secret setup passes its own (local-state) versions to reuse this palette.
  onChooseColor?: (name: Color) => void;
  onSubmitRow?: () => void;
  isCompleteRow?: boolean;
  // Colors to disable (already used) — the secret can't repeat a color.
  disabledColors?: Color[];
}

const ColorPicker = ({
  onChooseColor,
  onSubmitRow,
  isCompleteRow,
  disabledColors = [],
}: ColorPickerProps) => {
  const game = useGame();
  const chooseColor = onChooseColor ?? game.onChooseColor;
  const submitRow = onSubmitRow ?? game.onSubmitRow;
  const complete = isCompleteRow ?? game.isCompleteRow;

  return (
    <div className="picker-box">
      {(Object.keys(SIDEWAYS_COLORS) as Color[]).map((name) => {
        const colors = SIDEWAYS_COLORS[name];
        const disabled = disabledColors.includes(name);
        return (
          <div
            key={name}
            className="picker-color"
            style={{
              opacity: disabled ? 0.25 : 1,
              cursor: disabled ? "default" : "pointer",
            }}
            onClick={disabled ? undefined : () => chooseColor(name)}
          >
            <PegSideways colors={colors} />
          </div>
        );
      })}
      <div className="picker-color"></div>
      <Checkmark onSubmitRow={submitRow} isActive={complete} />
    </div>
  );
};

export default ColorPicker;
