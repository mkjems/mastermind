import boardReducer from './board';
import secretCodeReducer from './secretCode';
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
	GAME_BEGIN,
	GAME_GIVE_UP,
	GAME_INTRO,
	GAME_LOSE,
	GAME_WIN,
	HIDE_COLOR_PICKER,
	RESET_GAME,
	REVEAL_SECRET_CODE,
	SHOW_COLOR_PICKER,
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
			return action.activeRow;
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

// The board reducer needs to know which row is active, which peg is selected, and
// the secret code. Rather than read those from sibling reducers' freshly-computed
// output (a hidden ordering dependency), we attach them to the action up front,
// all derived from the *previous* state. BEGIN_NEW_ROW activates the next row, so
// its context carries the incremented index. With this, every slice reducer below
// depends only on its own previous state and the action — order no longer matters.
const decorateAction = (state, action) => {
	const context = {
		selectedPeg: state.selectedPeg,
		secretCode: state.secretCode,
		activeRow: action.type === BEGIN_NEW_ROW ? (state.activeRow ?? 0) + 1 : state.activeRow
	};
	return {...context, ...action};
};

export const reduceSingleAction = (state = {}, rawAction) => {
	const action = decorateAction(state, rawAction);

	const isRevealHidden = isRevealHiddenReducer(state.isRevealHidden, action);
	const isRulesHidden = isRulesHiddenReducer(state.isRulesHidden, action);
	const gameStatus = gameStatusReducer(state.gameStatus, action);
	const isCodeHidden = isCodeHiddenReducer(state.isCodeHidden, action);
	const selectedPeg = selectedPegReducer(state.selectedPeg, action);
	const activeRow = activeRowReducer(state.activeRow, action);
	const secretCode = secretCodeReducer(state.secretCode, action);
	const board = boardReducer(state.board, action);
	const showColorPicker = showColorsReducer(state.showColorPicker, action);

	return {
		isRevealHidden,
		isRulesHidden,
		gameStatus,
		isCodeHidden,
		selectedPeg,
		activeRow,
		board,
		secretCode,
		showColorPicker
	};
};
