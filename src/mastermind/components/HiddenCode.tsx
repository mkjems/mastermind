import React from "react";

import { useGame } from "../GameContext";
import Peg from "./Peg";
import styles from "./HiddenCode.module.css";

interface Params {}

const HiddenCode = (params: Params) => {
  const { secretCode, isCodeHidden } = useGame();
  return (
    <div className={styles.secret}>
      <div className={styles.cover}>
        <div className={styles.hiddenRow}>
          {secretCode.map((peg, index) => {
            return <Peg key={index} id={index} peg={peg} />;
          })}
        </div>
        <div
          className={
            isCodeHidden
              ? `${styles.slider} ${styles.sliderClosed}`
              : styles.slider
          }
        ></div>
      </div>
    </div>
  );
};

export default HiddenCode;
