import React from "react";

import { useGame } from "../GameContext";
import Board from "./Board";
import Overlay from "./Overlay";
import Won from "./Won";
import Lost from "./Lost";
import GaveUp from "./Gaveup";
import {
  GAME_STATUS_GAVE_UP,
  GAME_STATUS_LOST,
  GAME_STATUS_WON,
} from "../gameStatus";

// Human mode: the player guesses, cover at the top, rows filling top-down. When
// the game ends the cover slides aside (HiddenCode derives 'open' once the code is
// revealed) and the result message floats over the board in an Overlay — centred,
// so the revealed code stays visible above it.
const Gameplay = () => {
  const { canGiveUp, onGiveUp, gameStatus } = useGame();

  let message: React.ReactNode = null;
  if (gameStatus === GAME_STATUS_WON) {
    message = <Won />;
  } else if (gameStatus === GAME_STATUS_LOST) {
    message = <Lost />;
  } else if (gameStatus === GAME_STATUS_GAVE_UP) {
    message = <GaveUp />;
  }

  const footer = canGiveUp ? <button onClick={onGiveUp}>Give up</button> : null;
  const overlay = message ? <Overlay>{message}</Overlay> : null;

  return (
    <Board orientation="top-down" showCover footer={footer} overlay={overlay} />
  );
};

export default Gameplay;
