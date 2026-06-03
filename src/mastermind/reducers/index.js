import boardReducer from './board';
import secretCodeReducer from './secretCode';
import {NUM_ROWS} from '../script/constants.js';
import {
	GAME_STATUS_GAVE_UP,
	GAME_STATUS_INTRO,
	GAME_STATUS_LOST,
	GAME_STATUS_PLAYING,
	GAME_STATUS_WON
} from '../gameStatus.js';
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
	SHOW_COLOR_PICKER,
	START_GAME,
	SUBMIT_ROW,
	TOGGLE_RULES
} from '../gameActions.js';

const isRevealHiddenReducer = (state = false, action) => {
	switch (action.type) {
		case GAME_GIVE_UP:
			return true;
		case GAME_BEGIN:
			return false;
		case GAME_WIN:
			return true;
		case RESET_GAME:
			return false;
		default:
			return state;
	}
};

const isRulesHiddenReducer = (state = true, action) => {
	switch (action.type) {
		case TOGGLE_RULES:
			return !state;
		default:
			return state;
	}
};

const gameStatusReducer = (state = GAME_STATUS_INTRO, action) => {
	switch (action.type) {
		case GAME_BEGIN:
			return GAME_STATUS_PLAYING;
		case GAME_WIN:
			return GAME_STATUS_WON;
		case GAME_LOSE:
			return GAME_STATUS_LOST;
		case GAME_GIVE_UP:
			return GAME_STATUS_GAVE_UP;
		case GAME_INTRO:
			return GAME_STATUS_INTRO;
		default:
			return state;
	}
};

const isCodeHiddenReducer = (state = true, action) => {
	switch (action.type) {
		case REVEAL_SECRET_CODE:
			return false;
		case RESET_GAME:
			return true;
		default:
			return state;
	}
};

const selectedPegReducer = (state = undefined, action) => {
	switch (action.type) {
		case SHOW_COLOR_PICKER:
			return action.id;
		case BEGIN_NEW_ROW:
		case RESET_GAME:
			return undefined;
		case ADVANCE_SELECTOR: {
			const selectedPeg = action.pegs.findIndex((peg) => peg === 'select');
			return selectedPeg === -1 ? undefined : selectedPeg;
		}
		default:
			return state;
	}
};

const activeRowReducer = (state = 0, action) => {
	switch (action.type) {
		case BEGIN_NEW_ROW:
			return state + 1;
		case RESET_GAME:
			return 0;
		default:
			return state;
	}
};

const showColorsReducer = (state = false, action) => {
	switch (action.type) {
		case SHOW_COLOR_PICKER:
			return true;
		case HIDE_COLOR_PICKER:
			return false;
		case RESET_GAME:
			return false;
		default:
			return state;
	}
};

const reduceSingleAction = (state = {}, action) => {
	const isRevealHidden = isRevealHiddenReducer(state.isRevealHidden, action);
	const isRulesHidden = isRulesHiddenReducer(state.isRulesHidden, action);
	const gameStatus = gameStatusReducer(state.gameStatus, action);
	const isCodeHidden = isCodeHiddenReducer(state.isCodeHidden, action);
	const selectedPeg = selectedPegReducer(state.selectedPeg, action);
	const activeRow = activeRowReducer(state.activeRow, action);
	const secretCode = secretCodeReducer(state.secretCode, action);
	const board = boardReducer(state.board, action, activeRow, selectedPeg, secretCode);
	const showColorpicker = showColorsReducer(state.showColorpicker, action);

	return {
		isRevealHidden,
		isRulesHidden,
		gameStatus,
		isCodeHidden,
		selectedPeg,
		activeRow,
		board,
		secretCode,
		showColorpicker
	};
};

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
			const didSolveCode = feedbackState.board[feedbackState.activeRow].feedback.every((peg) => {
				return peg === 'red';
			});

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
