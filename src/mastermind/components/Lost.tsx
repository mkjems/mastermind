import React from "react";

import { useGame } from "../GameContext";

const Lost = () => {
  const { onResetAll } = useGame();
  return (
    <div className="board statusMessages">
      <p>You ran out of rows, you lost!</p>
      <button onClick={onResetAll}>Ok</button>
    </div>
  );
};

export default Lost;
