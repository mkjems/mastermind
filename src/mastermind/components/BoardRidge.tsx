import React from "react";

import styles from "./BoardRidge.module.css";

interface Props {
  children: React.ReactNode;
}

const BoardRidge = ({ children }: Props) => {
  return (
    <div className="board">
      <div className={styles.ridgeBottom}>
        <div className={styles.inset}>{children}</div>
      </div>
    </div>
  );
};

export default BoardRidge;
