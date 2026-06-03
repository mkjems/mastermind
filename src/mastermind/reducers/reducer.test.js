import {describe, expect, it} from 'vitest';

import reducer from './index.js';
import {NUM_ROWS, PEG_COLORS} from '../script/constants.js';
import {
	beginNewRow,
	chooseColorAndAdvance,
	giveUp,
	init,
	resetAll,
	showColorPicker,
	startGame,
	submitRow
} from '../gameActions.js';
import {
	GAME_STATUS_GAVE_UP,
	GAME_STATUS_INTRO,
	GAME_STATUS_LOST,
	GAME_STATUS_PLAYING,
	GAME_STATUS_WON
} from '../gameStatus.js';

const initState = () => reducer(undefined, init());

const chooseColor = (state, pegIndex, color) => {
	const selectedState = reducer(state, showColorPicker(pegIndex));
	return reducer(selectedState, chooseColorAndAdvance(color));
};

describe('mastermind reducer', () => {
	it('creates the initial intro state', () => {
		const state = initState();

		expect(state.gameStatus).toBe(GAME_STATUS_INTRO);
		expect(state.activeRow).toBe(0);
		expect(state.isCodeHidden).toBe(true);
		expect(state.isRulesHidden).toBe(true);
		expect(state.showColorpicker).toBe(false);
		expect(state.board).toHaveLength(NUM_ROWS);
		expect(state.board[0].pegs).toEqual(['select', 'select', 'select', 'select']);
		expect(state.board[0].feedback).toEqual(['none', 'none', 'none', 'none']);
		expect(state.secretCode).toHaveLength(4);
		expect(new Set(state.secretCode).size).toBe(4);
		expect(state.secretCode.every((color) => PEG_COLORS.includes(color))).toBe(true);
	});

	it('starts a game with a randomized secret code', () => {
		const initialState = initState();
		const playingState = reducer(initialState, startGame());

		expect(playingState.gameStatus).toBe(GAME_STATUS_PLAYING);
		expect(playingState.secretCode).toHaveLength(4);
		expect(new Set(playingState.secretCode).size).toBe(4);
		expect(playingState.secretCode.every((color) => PEG_COLORS.includes(color))).toBe(true);
	});

	it('chooses a color and advances the selected peg', () => {
		const state = chooseColor(initState(), 0, 'yellow');

		expect(state.board[0].pegs).toEqual(['yellow', 'select', 'select', 'select']);
		expect(state.selectedPeg).toBe(1);
		expect(state.showColorpicker).toBe(true);
	});

	it('gives red, white, and empty feedback for a submitted row', () => {
		const initialState = initState();
		const state = {
			...initialState,
			secretCode: ['yellow', 'green', 'blue', 'pink'],
			board: [
				{
					pegs: ['yellow', 'blue', 'silver', 'pink'],
					feedback: ['none', 'none', 'none', 'none']
				},
				...initialState.board.slice(1)
			]
		};

		const feedbackState = reducer(state, submitRow());

		expect(feedbackState.board[0].feedback).toEqual(['red', 'red', 'white', 'none']);
		expect(feedbackState.activeRow).toBe(1);
		expect(feedbackState.showColorpicker).toBe(false);
	});

	it('wins when the active row matches the secret code', () => {
		const initialState = initState();
		const state = {
			...initialState,
			gameStatus: GAME_STATUS_PLAYING,
			secretCode: ['yellow', 'green', 'blue', 'pink'],
			board: [
				{
					pegs: ['yellow', 'green', 'blue', 'pink'],
					feedback: ['none', 'none', 'none', 'none']
				},
				...initialState.board.slice(1)
			]
		};

		const wonState = reducer(state, submitRow());

		expect(wonState.gameStatus).toBe(GAME_STATUS_WON);
		expect(wonState.isCodeHidden).toBe(false);
		expect(wonState.isRevealHidden).toBe(true);
		expect(wonState.board[0].feedback).toEqual(['red', 'red', 'red', 'red']);
	});

	it('loses when the last row does not match the secret code', () => {
		const initialState = initState();
		const lastRow = NUM_ROWS - 1;
		const board = initialState.board.map((row, index) => {
			if (index !== lastRow) {
				return row;
			}

			return {
				pegs: ['yellow', 'green', 'blue', 'pink'],
				feedback: ['none', 'none', 'none', 'none']
			};
		});
		const state = {
			...initialState,
			activeRow: lastRow,
			gameStatus: GAME_STATUS_PLAYING,
			secretCode: ['silver', 'white', 'red', 'orange'],
			board
		};

		const lostState = reducer(state, submitRow());

		expect(lostState.gameStatus).toBe(GAME_STATUS_LOST);
		expect(lostState.isCodeHidden).toBe(false);
		expect(lostState.activeRow).toBe(lastRow);
		expect(lostState.board[lastRow].feedback).toEqual(['none', 'none', 'none', 'none']);
	});

	it('reveals the code and marks the game as gave up', () => {
		const gaveUpState = reducer(reducer(initState(), startGame()), giveUp());

		expect(gaveUpState.gameStatus).toBe(GAME_STATUS_GAVE_UP);
		expect(gaveUpState.isCodeHidden).toBe(false);
		expect(gaveUpState.isRevealHidden).toBe(true);
		expect(gaveUpState.showColorpicker).toBe(false);
	});

	it('resets game progress and returns to the intro', () => {
		const playingState = reducer(reducer(initState(), startGame()), beginNewRow());
		const resetState = reducer(playingState, resetAll());

		expect(resetState.gameStatus).toBe(GAME_STATUS_INTRO);
		expect(resetState.activeRow).toBe(0);
		expect(resetState.isCodeHidden).toBe(true);
		expect(resetState.showColorpicker).toBe(false);
		expect(resetState.board).toHaveLength(NUM_ROWS);
		expect(resetState.board[0].pegs).toEqual(['select', 'select', 'select', 'select']);
	});
});
