import React from "react";

import { useGame } from "../GameContext";
import styles from "./Menu.module.css";

// The main menu: title + three stacked actions. Rendered inside an Overlay panel
// (which provides the vertical stacking and centring) over the empty board.
const Menu = () => {
  const { onStartGame, onStartAlgorithm, onToggleRules } = useGame();
  return (
    <>
      <h1 className={styles.title}>Mastermind</h1>
      <button className={styles.button} onClick={onStartGame}>
        Play a game
      </button>
      <button className={styles.button} onClick={onStartAlgorithm}>
        Play algorithm
      </button>
      <button className={styles.button} onClick={onToggleRules}>
        See rules
      </button>
    </>
  );
};

export default Menu;
