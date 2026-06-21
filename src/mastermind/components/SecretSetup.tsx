import React, { useState } from "react";

import { useGame } from "../GameContext";
import type { Color, PegValue } from "../types";
import Board from "./Board";
import BoardRidge from "./BoardRidge";
import Peg from "./Peg";
import ColorPicker from "./ColorPicker";

const SECRET_LENGTH = 4;
const EMPTY: (Color | null)[] = [null, null, null, null];

// P2.4 / P3.3: the human sets the secret the computer will try to crack. It works
// exactly like picking a guess row in the human game — click a hole to select it
// (ring highlight), pick a color from the mushroom palette to drop it in, and come
// back to change any hole. Only the green checkmark finishes. Colors must be distinct
// (the solver only considers codes with no repeats), so used colors are disabled.
const SecretSetup = () => {
  const { onConfirmSecret } = useGame();
  const [secret, setSecret] = useState<(Color | null)[]>(EMPTY);
  const [selected, setSelected] = useState(0);

  const chooseColor = (color: Color) => {
    if (secret.includes(color)) {
      return;
    }
    const next = [...secret];
    next[selected] = color;
    setSecret(next);
    // Advance to the next empty hole, like the human picker does.
    const nextEmpty = next.findIndex((value) => value === null);
    if (nextEmpty !== -1) {
      setSelected(nextEmpty);
    }
  };

  const isComplete = secret.every((value) => value !== null);
  const usedColors = secret.filter((value): value is Color => value !== null);
  const confirm = () => onConfirmSecret(secret as Color[]);

  const footer = (
    <div>
      <ColorPicker
        onChooseColor={chooseColor}
        onSubmitRow={confirm}
        isCompleteRow={isComplete}
        disabledColors={usedColors}
      />

      <BoardRidge>
        <div className="board-row" style={{ justifyContent: "space-evenly" }}>
          {Array.from({ length: SECRET_LENGTH }, (_, index) => {
            const value = secret[index];
            const peg: PegValue =
              value ?? (index === selected ? "select" : "none");
            return (
              <Peg
                key={index}
                id={index}
                peg={peg}
                isSelected={index === selected}
                onPegClick={() => setSelected(index)}
              />
            );
          })}
        </div>
      </BoardRidge>
    </div>
  );

  return <Board orientation="bottom-up" interactive={false} footer={footer} />;
};

export default SecretSetup;
