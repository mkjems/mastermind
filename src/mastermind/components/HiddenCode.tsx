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
//
// The row is laid out like a board row — four peg columns plus a fifth column (the
// feedback position) that holds the optional `action` (the Peek button) — so the
// secret pegs line up with the holes above and the action sits inside the frame.
export type CoverState = "closed" | "peek" | "open";

interface Props {
  coverState?: CoverState;
  action?: React.ReactNode;
}

const HiddenCode = ({ coverState, action }: Props) => {
  const { secretCode, isCodeHidden } = useGame();
  const state: CoverState = coverState ?? (isCodeHidden ? "closed" : "open");
  return (
    <div className={styles.secret}>
      <div className={styles.row}>
        {secretCode.map((peg, index) => {
          return <Peg key={index} id={index} peg={peg} />;
        })}
        <div className="peg">{action}</div>
      </div>
      <div className={`${styles.slider} ${styles[state]}`}></div>
    </div>
  );
};

export default HiddenCode;
