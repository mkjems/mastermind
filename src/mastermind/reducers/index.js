import boardReducer from './board.js';
import secretCodeReducer from './secretCode.js';
import {calculateFeedback, isSolved} from './row.js';
import {
	activeRowReducer,
	gameStatusReducer,
	isRulesHiddenReducer,
	selectedPegReducer,
	showColorPickerReducer
} from './stateReducers.js';
import {EVENT_LOSE, EVENT_WIN} from '../gameStatus.js';
import {
	CHOOSE_COLOR_AND_ADVANCE,
	GIVE_UP,
	SUBMIT_ROW
} from '../gameActions.js';
import {NUM_ROWS} from '../script/constants.js';

// Enrich an action with the context the slice reducers need, all derived from the
// *previous* state, so each reducer reads only its own slice plus the action (no
// reducer depends on another's freshly-computed output). This is also the single
// place where the win/lose/continue outcome of a submitted row is decided.
const decorateAction = (state, action) => {
	switch (action.type) {
		case CHOOSE_COLOR_AND_ADVANCE: {
			const {activeRow, selectedPeg, board} = state;
			if (selectedPeg === undefined) {
				return {...action, activeRow, selectedPeg};
			}
			const pegs = board[activeRow].pegs.map((peg, index) => {
				return index === selectedPeg ? action.name : peg;
			});
			const next = pegs.findIndex((peg) => peg === 'select');
			return {
				...action,
				activeRow,
				selectedPeg,
				pegs,
				nextSelectedPeg: next === -1 ? undefined : next
			};
		}
		case SUBMIT_ROW: {
			const submittedRow = state.activeRow;
			const feedback = calculateFeedback(state.secretCode, state.board[submittedRow].pegs);
			const event = isSolved(feedback)
				? EVENT_WIN
				: submittedRow + 1 === NUM_ROWS ? EVENT_LOSE : null;
			const continues = event === null;
			return {
				...action,
				submittedRow,
				feedback,
				event,
				continues,
				activeRow: continues ? submittedRow + 1 : submittedRow
			};
		}
		case GIVE_UP:
			return {...action, activeRow: state.activeRow};
		default:
			return action;
	}
};

const reducer = (state = {}, rawAction) => {
	const action = decorateAction(state, rawAction);

	return {
		gameStatus: gameStatusReducer(state.gameStatus, action),
		secretCode: secretCodeReducer(state.secretCode, action),
		activeRow: activeRowReducer(state.activeRow, action),
		selectedPeg: selectedPegReducer(state.selectedPeg, action),
		board: boardReducer(state.board, action),
		showColorPicker: showColorPickerReducer(state.showColorPicker, action),
		isRulesHidden: isRulesHiddenReducer(state.isRulesHidden, action)
	};
};

export default reducer;
