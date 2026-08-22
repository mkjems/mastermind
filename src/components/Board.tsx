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
  // Feedback to show on the active row instead of its stored value — algorithm mode
  // uses it to show the score being entered live against the computer's guess.
  liveFeedback?: FeedbackPeg[];
  // Content rendered next to the active row (e.g. the feedback scoring buttons). In
  // bottom-up orientation it appears just above the active guess.
  activeRowExtra?: React.ReactNode;
  // Content rendered beside the cover (e.g. the Peek button), inside the secret box.
  coverAction?: React.ReactNode;
  // Controls below the board (palette, Give up, status text).
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
  liveFeedback,
  activeRowExtra,
  coverAction,
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
          {showCover ? (
            <HiddenCode coverState={coverState} action={coverAction} />
          ) : null}

          {board.map((row, index) => {
            const hidden = index >= shown;
            const isActive = index === activeRow;
            const feedback =
              isActive && !hidden && liveFeedback
                ? liveFeedback
                : hidden
                  ? BLANK_FEEDBACK
                  : row.feedback;
            return (
              <React.Fragment key={index}>
                <BoardRow
                  pegs={hidden ? BLANK_PEGS : row.pegs}
                  feedbackPegs={feedback}
                  isActiveRow={interactive && isActive}
                />
                {isActive && activeRowExtra ? activeRowExtra : null}
              </React.Fragment>
            );
          })}
        </div>

        {footer ? <div className={styles.footer}>{footer}</div> : null}
      </BoardRidge>

      {overlay}
    </div>
  );
};

export default Board;
