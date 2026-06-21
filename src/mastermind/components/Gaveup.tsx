import React from "react";

import { useGame } from "../GameContext";

const GaveUp = () => {
  const { onResetAll, activeRow } = useGame();
  return (
    <div className="status-messages">
      <p>You gave up after {activeRow} attempts.</p>
      <button onClick={onResetAll}>Ok</button>
    </div>
  );
};

export default GaveUp;
