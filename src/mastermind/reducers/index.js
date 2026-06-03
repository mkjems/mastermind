import boardReducer from './board';
import secretCodeReducer from './secretCode';

const isRevealHiddenReducer = (state = false, action) => {
	switch (action.type) {
		case 'GAME_GIVE_UP':
			return true;
		case 'GAME_BEGIN':
			return false;
		case 'GAME_WIN':
			return true;
		case 'RESET_GAME':
			return false;
		default:
			return state;
	}
};

const isRulesHiddenReducer = (state = true, action) => {
	switch (action.type) {
		case 'TOGGLE_RULES':
			return !state;
		default:
			return state;
	}
};

const gameStatusReducer = (state = 'intro', action) => {
	switch (action.type) {
		case 'GAME_BEGIN':
			return 'playing';
		case 'GAME_WIN':
			return 'won';
		case 'GAME_LOSE':
			return 'lost';
		case 'GAME_GIVE_UP':
			return 'gave_up';
		case 'GAME_INTRO':
			return 'intro';
		default:
			return state;
	}
};

const isCodeHiddenReducer = (state = true, action) => {
	switch (action.type) {
		case 'REVEAL_SECRET_CODE':
			return false;
		case 'RESET_GAME':
			return true;
		default:
			return state;
	}
};

const selectedPegReducer = (state = undefined, action) => {
	switch (action.type) {
		case 'SHOW_COLOR_PICKER':
			return action.id;
		case 'BEGIN_NEW_ROW':
		case 'RESET_GAME':
			return undefined;
		case 'ADVANCE_SELECTOR': {
			const selectedPeg = action.pegs.findIndex((peg) => peg === 'select');
			return selectedPeg === -1 ? undefined : selectedPeg;
		}
		default:
			return state;
	}
};

const activeRowReducer = (state = 0, action) => {
	switch (action.type) {
		case 'BEGIN_NEW_ROW':
			return state + 1;
		case 'RESET_GAME':
			return 0;
		default:
			return state;
	}
};

const showColorsReducer = (state = false, action) => {
	switch (action.type) {
		case 'SHOW_COLOR_PICKER':
			return true;
		case 'HIDE_COLOR_PICKER':
			return false;
		case 'RESET_GAME':
			return false;
		default:
			return state;
	}
};

const reducer = (state = {}, action) => {
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

export default reducer;
