import React from "react";

import { useGame } from "../GameContext";
import Board from "./Board";
import Overlay from "./Overlay";
import Menu from "./Menu";
import Rules from "./Rules";

// The home screen: the empty board rendered for real, with the main menu (or the
// rules, when toggled) floating over it in an Overlay panel.
const Home = () => {
  const { isRulesHidden, onToggleRules } = useGame();
  const overlay = (
    <Overlay>
      {isRulesHidden ? (
        <Menu />
      ) : (
        <>
          <Rules />
          <button onClick={onToggleRules}>Back</button>
        </>
      )}
    </Overlay>
  );
  return <Board showCover={false} overlay={overlay} />;
};

export default Home;
