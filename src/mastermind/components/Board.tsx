import React from "react";

import { useGame } from "../GameContext";
import BoardRidge from "./BoardRidge";
import BoardRow from "./BoardRow";
import HiddenCode from "./HiddenCode";
import type { CoverState } from "./HiddenCode";
import type { FeedbackPeg, PegValue } from "../types";
import styles from "./Board.module.css";

export type Orientation = "top-down" | "bottom-up";

const BLANK_PEGS: PegValue[] = ["none", "none", "none", "none"];
const BLANK_FEEDBACK: FeedbackPeg[] = ["none", "none", "none", "none"];

interface BoardProps {
  // 'top-down' (human): cover at the top, rows fill downward.
  // 'bottom-up' (algorithm): cover at the bottom, rows build upward.
  orientation?: Orientation;
  // Whether to render the secret-code cover at all (off for the menu backdrop).
  showCover?: boolean;
  // Drives the cover (peek / open / closed); falls back to HiddenCode's own
  // derivation from whether the code is hidden when omitted.
  coverState?: CoverState;
  // Rows from this index up render as empty holes regardless of their content —
  // used in algorithm mode to withhold a freshly-computed guess until it's revealed.
  revealedRows?: number;
  // Whether a row can be the active, clickable one. Off in algorithm mode, where
  // the human never fills a row (the computer guesses).
  interactive?: boolean;
  // Controls below the board (palette, feedback picker, Peek, Give up).
  footer?: React.ReactNode;
  // A panel floating over the board (main menu, rules, result message).
  overlay?: React.ReactNode;
}

// The one board both modes (and the menu/rules backdrop) render through. It draws
// the ridge frame, the optional secret cover, and the rows from game state. The
// per-row color picker still lives in BoardRow; the `overlay` slot here is for
// whole-board panels.
const Board = ({
  orientation = "top-down",
  showCover = false,
  coverState,
  revealedRows,
  interactive = true,
  footer,
  overlay,
}: BoardProps) => {
  const { board, activeRow } = useGame();
  const reversed = orientation === "bottom-up";
  const stackClass = reversed
    ? `${styles.stack} ${styles.reversed}`
    : styles.stack;
  const shown = revealedRows ?? board.length;

  return (
    <div className={styles.frame}>
      <BoardRidge>
        <div className={stackClass}>
          {showCover ? <HiddenCode coverState={coverState} /> : null}

          {board.map((row, index) => {
            const hidden = index >= shown;
            return (
              <BoardRow
                key={index}
                pegs={hidden ? BLANK_PEGS : row.pegs}
                feedbackPegs={hidden ? BLANK_FEEDBACK : row.feedback}
                isActiveRow={interactive && activeRow === index}
              />
            );
          })}
        </div>
      </BoardRidge>

      {footer ? <div className="bottom-part">{footer}</div> : null}
      {overlay}
    </div>
  );
};

export default Board;
