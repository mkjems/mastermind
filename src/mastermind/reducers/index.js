import {NUM_ROWS} from '../script/constants.js';
import {
	ADVANCE_SELECTOR,
	BEGIN_NEW_ROW,
	CHOOSE_COLOR_AND_ADVANCE,
	CHOSE_THIS_COLOR,
	GAME_BEGIN,
	GAME_GIVE_UP,
	GAME_INTRO,
	GAME_LOSE,
	GAME_WIN,
	GIVE_FEEDBACK,
	GIVE_UP,
	HIDE_COLOR_PICKER,
	RANDOMIZE_SECRET_CODE,
	RESET_ALL,
	RESET_GAME,
	REVEAL_SECRET_CODE,
	START_GAME,
	SUBMIT_ROW
} from '../gameActions.js';
import {reduceSingleAction} from './stateReducers.js';
import {isSolved} from './row.js';

const reducer = (state = {}, action) => {
	switch (action.type) {
		case CHOOSE_COLOR_AND_ADVANCE: {
			const colorState = reduceSingleAction(state, {type: CHOSE_THIS_COLOR, name: action.name});
			return reduceSingleAction(colorState, {
				type: ADVANCE_SELECTOR,
				pegs: colorState.board[colorState.activeRow].pegs
			});
		}
		case SUBMIT_ROW: {
			const feedbackState = reduceSingleAction(state, {type: GIVE_FEEDBACK});
			const hiddenPickerState = reduceSingleAction(feedbackState, {type: HIDE_COLOR_PICKER});
			const didSolveCode = isSolved(feedbackState.board[feedbackState.activeRow].feedback);

			if (didSolveCode) {
				const wonState = reduceSingleAction(hiddenPickerState, {type: GAME_WIN});
				return reduceSingleAction(wonState, {type: REVEAL_SECRET_CODE});
			}

			if (NUM_ROWS !== feedbackState.activeRow + 1) {
				return reduceSingleAction(hiddenPickerState, {type: BEGIN_NEW_ROW});
			}

			const revealedState = reduceSingleAction(hiddenPickerState, {type: REVEAL_SECRET_CODE});
			return reduceSingleAction(revealedState, {type: GAME_LOSE});
		}
		case START_GAME: {
			const randomizedState = reduceSingleAction(state, {type: RANDOMIZE_SECRET_CODE});
			return reduceSingleAction(randomizedState, {type: GAME_BEGIN});
		}
		case RESET_ALL: {
			const introState = reduceSingleAction(state, {type: GAME_INTRO});
			return reduceSingleAction(introState, {type: RESET_GAME});
		}
		case GIVE_UP: {
			const revealedState = reduceSingleAction(state, {type: REVEAL_SECRET_CODE});
			const hiddenPickerState = reduceSingleAction(revealedState, {type: HIDE_COLOR_PICKER});
			return reduceSingleAction(hiddenPickerState, {type: GAME_GIVE_UP});
		}
		default:
			return reduceSingleAction(state, action);
	}
};

export default reducer;
