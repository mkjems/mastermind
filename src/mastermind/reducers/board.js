import {BOARD_START} from '../script/constants.js';
import {
	BEGIN_NEW_ROW,
	CHOSE_THIS_COLOR,
	GAME_GIVE_UP,
	GIVE_FEEDBACK,
	RESET_GAME
} from '../gameActions.js';

import rowReducer from './row.js';

const updateRows = (rows, action, activeRow) => {
	return rows.map((row, index) => {
		return rowReducer(row, {
			...action,
			isActiveRow: index === activeRow
		});
	});
};

const boardReducer = (state = BOARD_START, action, activeRow, selectedPeg, secretCode) => {
	const rowAction = {
		...action,
		selectedPeg,
		secretCode
	};

	switch (action.type) {
		case GAME_GIVE_UP:
		case BEGIN_NEW_ROW:
		case GIVE_FEEDBACK:
			return updateRows(state, rowAction, activeRow);
		case CHOSE_THIS_COLOR:
			if (selectedPeg === undefined) {
				return state;
			}
			return updateRows(state, rowAction, activeRow);
		case RESET_GAME:
			return BOARD_START;
		default:
			return state;
	}
};

export default boardReducer;
