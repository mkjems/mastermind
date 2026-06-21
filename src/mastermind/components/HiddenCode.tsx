import React from "react";

import { useGame } from "../GameContext";
import Peg from "./Peg";
import styles from "./HiddenCode.module.css";

// The cover over the secret code. Three states drive the same sliding cover:
//   closed — fully covering the code (in play)
//   peek   — lifted a little to reveal a sliver (the algorithm-mode Peek button)
//   open   — slid aside to reveal the code (win / give-up reveal)
// When no explicit state is passed it derives from whether the code is hidden, so
// existing callers keep working: hidden → closed, revealed → open.
export type CoverState = "closed" | "peek" | "open";

interface Props {
  coverState?: CoverState;
}

const HiddenCode = ({ coverState }: Props) => {
  const { secretCode, isCodeHidden } = useGame();
  const state: CoverState = coverState ?? (isCodeHidden ? "closed" : "open");
  return (
    <div className={styles.secret}>
      <div className={styles.cover}>
        <div className={styles["hidden-row"]}>
          {secretCode.map((peg, index) => {
            return <Peg key={index} id={index} peg={peg} />;
          })}
        </div>
        <div className={`${styles.slider} ${styles[state]}`}></div>
      </div>
    </div>
  );
};

export default HiddenCode;
