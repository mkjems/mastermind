import {BOARD_START} from '../script/constants.js';
import {
	CHOOSE_COLOR_AND_ADVANCE,
	GIVE_UP,
	RESET_ALL,
	SUBMIT_ROW
} from '../gameActions.js';

const SELECTABLE_ROW_PEGS = ['select', 'select', 'select', 'select'];

const replaceRow = (board, index, changes) => {
	return board.map((row, i) => (i === index ? {...row, ...changes} : row));
};

const boardReducer = (state = BOARD_START, action) => {
	switch (action.type) {
		case CHOOSE_COLOR_AND_ADVANCE:
			if (action.selectedPeg === undefined) {
				return state;
			}
			return replaceRow(state, action.activeRow, {pegs: action.pegs});
		case SUBMIT_ROW: {
			const scored = replaceRow(state, action.submittedRow, {feedback: action.feedback});
			if (!action.continues) {
				return scored;
			}
			return replaceRow(scored, action.activeRow, {pegs: [...SELECTABLE_ROW_PEGS]});
		}
		case GIVE_UP:
			return replaceRow(state, action.activeRow, {
				pegs: state[action.activeRow].pegs.map((peg) => (peg === 'select' ? 'none' : peg))
			});
		case RESET_ALL:
			return BOARD_START;
		default:
			return state;
	}
};

export default boardReducer;
