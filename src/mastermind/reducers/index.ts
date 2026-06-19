import boardReducer from './board';
import secretCodeReducer from './secretCode';
import {calculateFeedback, isSolved} from './row';
import {
	activeRowReducer,
	gameStatusReducer,
	isRulesHiddenReducer,
	modeReducer,
	selectedPegReducer,
	showColorPickerReducer
} from './stateReducers';
import {nextGuess} from '../solver';
import type {ScoredGuess} from '../solver';
import {EVENT_FAILED, EVENT_LOSE, EVENT_SOLVED, EVENT_WIN} from '../gameStatus';
import {
	CHOOSE_COLOR_AND_ADVANCE,
	CONFIRM_SECRET,
	GIVE_UP,
	SUBMIT_FEEDBACK,
	SUBMIT_ROW
} from '../gameActions';
import type {Action, DecoratedAction} from '../gameActions';
import type {Color, GameState} from '../types';
import {NUM_ROWS} from '../script/constants';

// Enrich an action with the context the slice reducers need, all derived from the
// *previous* state, so each reducer reads only its own slice plus the action (no
// reducer depends on another's freshly-computed output). This is also the single
// place where the win/lose/continue outcome of a submitted row is decided.
const decorateAction = (state: GameState, action: Action): DecoratedAction => {
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
		case CONFIRM_SECRET:
			// Algorithm mode begins: the computer's opening guess goes on row 0.
			return {...action, computerGuess: nextGuess([])};
		case SUBMIT_FEEDBACK: {
			const submittedRow = state.activeRow;
			const solved = isSolved(action.feedback);
			if (solved) {
				return {...action, submittedRow, event: EVENT_SOLVED, continues: false};
			}
			// Replay the scored rows (this row's feedback is the human's new input)
			// to find the codes still possible, then the computer's next guess.
			const history: ScoredGuess[] = state.board.slice(0, submittedRow + 1).map((row, index) => ({
				guess: row.pegs as Color[],
				feedback: index === submittedRow ? action.feedback : row.feedback
			}));
			const guess = nextGuess(history);
			const outOfRows = submittedRow + 1 >= NUM_ROWS;
			if (guess === undefined || outOfRows) {
				return {...action, submittedRow, event: EVENT_FAILED, continues: false};
			}
			return {
				...action,
				submittedRow,
				event: null,
				continues: true,
				activeRow: submittedRow + 1,
				computerGuess: guess
			};
		}
		default:
			return action;
	}
};

const reduceSlices = (state: Partial<GameState>, action: DecoratedAction): GameState => ({
	gameStatus: gameStatusReducer(state.gameStatus, action),
	secretCode: secretCodeReducer(state.secretCode, action),
	activeRow: activeRowReducer(state.activeRow, action),
	selectedPeg: selectedPegReducer(state.selectedPeg, action),
	board: boardReducer(state.board, action),
	showColorPicker: showColorPickerReducer(state.showColorPicker, action),
	isRulesHidden: isRulesHiddenReducer(state.isRulesHidden, action),
	mode: modeReducer(state.mode, action)
});

const reducer = (state: GameState | undefined, rawAction: Action): GameState => {
	if (state === undefined) {
		return reduceSlices({}, rawAction);
	}
	const action = decorateAction(state, rawAction);
	return reduceSlices(state, action);
};

export default reducer;
