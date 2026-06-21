import React from "react";

import { useGame } from "../GameContext";

const Lost = () => {
  const { onResetAll } = useGame();
  return (
    <>
      <p>You ran out of rows, you lost!</p>
      <button onClick={onResetAll}>Ok</button>
    </>
  );
};

export default Lost;
