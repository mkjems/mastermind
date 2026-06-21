import React, { useState } from "react";

import { useGame } from "../GameContext";
import { PEG_COLORS, TOP_VIEW_COLORS } from "../script/constants";
import type { Color } from "../types";
import Board from "./Board";
import Peg from "./Peg";
import PegIllu from "./PegIllu";
import Checkmark from "./Checkmark";

const SECRET_LENGTH = 4;

// P2.4 / P3.3: the human sets the secret the computer will try to crack. It plays
// almost like guessing — colors are picked from the mushroom palette into the target
// row at the bottom (the end the computer will face). Colors must be distinct (the
// game's codes never repeat a color), so already-picked colors are disabled.
const SecretSetup = () => {
  const { onConfirmSecret } = useGame();
  const [secret, setSecret] = useState<Color[]>([]);

  const addColor = (color: Color) => {
    if (secret.length >= SECRET_LENGTH || secret.includes(color)) {
      return;
    }
    setSecret([...secret, color]);
  };

  const isComplete = secret.length === SECRET_LENGTH;

  const footer = (
    <div>
      <p>Set a secret code for the computer to crack.</p>

      <div className="board-row" style={{ justifyContent: "center" }}>
        {Array.from({ length: SECRET_LENGTH }, (_, index) => (
          <Peg
            key={index}
            id={index}
            peg={secret[index] ?? "select"}
            isSelected={index === secret.length}
          />
        ))}
      </div>

      <div className="picker-box">
        {PEG_COLORS.map((color) => {
          const used = secret.includes(color);
          return (
            <div
              key={color}
              className="picker-color"
              style={{
                opacity: used ? 0.25 : 1,
                cursor: used ? "default" : "pointer",
              }}
              onClick={() => addColor(color)}
            >
              <PegIllu colors={TOP_VIEW_COLORS[color]} />
            </div>
          );
        })}
        <Checkmark
          onSubmitRow={() => onConfirmSecret(secret)}
          isActive={isComplete}
        />
      </div>

      <button onClick={() => setSecret([])} disabled={secret.length === 0}>
        Clear
      </button>
    </div>
  );

  return <Board orientation="bottom-up" interactive={false} footer={footer} />;
};

export default SecretSetup;
