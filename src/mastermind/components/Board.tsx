import React from "react";

import { useGame } from "../GameContext";
import BoardRidge from "./BoardRidge";
import BoardRow from "./BoardRow";
import HiddenCode from "./HiddenCode";
import styles from "./Board.module.css";

export type Orientation = "top-down" | "bottom-up";

interface BoardProps {
  // 'top-down' (human): cover at the top, rows fill downward.
  // 'bottom-up' (algorithm): cover at the bottom, rows build upward.
  orientation?: Orientation;
  // Whether to render the secret-code cover at all (off for the menu backdrop).
  showCover?: boolean;
  // Controls below the board (palette, feedback picker, Peek, Give up).
  footer?: React.ReactNode;
  // A panel floating over the board (main menu, rules).
  overlay?: React.ReactNode;
}

// The one board both modes (and the menu/rules backdrop) render through. It draws
// the ridge frame, the optional secret cover, and the rows from game state. The
// per-row overlays (color picker, win/lost/gave-up) still live in BoardRow; the
// `overlay` slot here is for whole-board panels.
const Board = ({
  orientation = "top-down",
  showCover = false,
  footer,
  overlay,
}: BoardProps) => {
  const { board, activeRow } = useGame();
  const reversed = orientation === "bottom-up";
  const stackClass = reversed
    ? `${styles.stack} ${styles.reversed}`
    : styles.stack;

  return (
    <div className={styles.frame}>
      <BoardRidge>
        <div className={stackClass}>
          {showCover ? <HiddenCode /> : null}

          {board.map((row, index) => (
            <BoardRow
              key={index}
              pegs={row.pegs}
              feedbackPegs={row.feedback}
              isActiveRow={activeRow === index}
            />
          ))}
        </div>
      </BoardRidge>

      {footer ? <div className="bottom-part">{footer}</div> : null}
      {overlay}
    </div>
  );
};

export default Board;
