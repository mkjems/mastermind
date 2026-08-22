import { BOARD_START, NUM_ROWS } from "../script/constants";
import {
  CHOOSE_COLOR_AND_ADVANCE,
  CONFIRM_SECRET,
  GIVE_UP,
  RESET_ALL,
  SUBMIT_FEEDBACK,
  SUBMIT_ROW,
} from "../gameActions";
import type { DecoratedAction } from "../gameActions";
import type { Board, PegValue, Row } from "../types";

const SELECTABLE_ROW_PEGS: PegValue[] = [
  "select",
  "select",
  "select",
  "select",
];

const replaceRow = (
  board: Board,
  index: number,
  changes: Partial<Row>,
): Board => {
  return board.map((row, i) => (i === index ? { ...row, ...changes } : row));
};

// A board of all-empty rows — algorithm mode fills rows with the computer's
// guesses rather than starting with a selectable first row.
const blankBoard = (): Board =>
  Array.from({ length: NUM_ROWS }, () => ({
    pegs: ["none", "none", "none", "none"] as PegValue[],
    feedback: ["none", "none", "none", "none"],
  }));

const boardReducer = (
  state: Board = BOARD_START,
  action: DecoratedAction,
): Board => {
  switch (action.type) {
    case CHOOSE_COLOR_AND_ADVANCE:
      if (
        action.selectedPeg === undefined ||
        action.pegs === undefined ||
        action.activeRow === undefined
      ) {
        return state;
      }
      return replaceRow(state, action.activeRow, { pegs: action.pegs });
    case SUBMIT_ROW: {
      if (action.submittedRow === undefined || action.feedback === undefined) {
        return state;
      }
      const scored = replaceRow(state, action.submittedRow, {
        feedback: action.feedback,
      });
      if (!action.continues || action.activeRow === undefined) {
        return scored;
      }
      return replaceRow(scored, action.activeRow, {
        pegs: [...SELECTABLE_ROW_PEGS],
      });
    }
    case GIVE_UP: {
      if (action.activeRow === undefined) {
        return state;
      }
      return replaceRow(state, action.activeRow, {
        pegs: state[action.activeRow].pegs.map((peg) =>
          peg === "select" ? "none" : peg,
        ),
      });
    }
    case CONFIRM_SECRET: {
      // Algorithm mode: fresh board with the computer's opening guess on row 0.
      if (action.computerGuess === undefined) {
        return state;
      }
      return replaceRow(blankBoard(), 0, { pegs: action.computerGuess });
    }
    case SUBMIT_FEEDBACK: {
      if (action.submittedRow === undefined || action.feedback === undefined) {
        return state;
      }
      const scored = replaceRow(state, action.submittedRow, {
        feedback: action.feedback,
      });
      if (
        !action.continues ||
        action.computerGuess === undefined ||
        action.activeRow === undefined
      ) {
        return scored;
      }
      return replaceRow(scored, action.activeRow, {
        pegs: action.computerGuess,
      });
    }
    case RESET_ALL:
      return BOARD_START;
    default:
      return state;
  }
};

export default boardReducer;
