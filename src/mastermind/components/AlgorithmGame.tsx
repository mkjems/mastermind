import React from "react";

import { useGame } from "../GameContext";
import {
  GAME_STATUS_ALGO_FAILED,
  GAME_STATUS_ALGO_GUESSING,
  GAME_STATUS_ALGO_SETUP,
  GAME_STATUS_ALGO_SOLVED,
} from "../gameStatus";
import SecretSetup from "./SecretSetup";
import AlgorithmBoard from "./AlgorithmBoard";
import AlgorithmResult from "./AlgorithmResult";

const AlgorithmGame = () => {
  const { gameStatus } = useGame();
  switch (gameStatus) {
    case GAME_STATUS_ALGO_SETUP:
      return <SecretSetup />;
    case GAME_STATUS_ALGO_GUESSING:
      return <AlgorithmBoard />;
    case GAME_STATUS_ALGO_SOLVED:
    case GAME_STATUS_ALGO_FAILED:
      return <AlgorithmResult />;
    default:
      return null;
  }
};

export default AlgorithmGame;
