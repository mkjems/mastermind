import {describe, expect, it} from 'vitest';

import reducer from './index.js';
import {NUM_ROWS, PEG_COLORS} from '../script/constants.js';
import {
	BEGIN_NEW_ROW,
	CHOOSE_COLOR_AND_ADVANCE,
	GIVE_UP,
	INIT,
	RESET_ALL,
	SHOW_COLOR_PICKER,
	START_GAME,
	SUBMIT_ROW
} from '../gameActions.js';

const initState = () => reducer(undefined, {type: INIT});

const chooseColor = (state, pegIndex, color) => {
	const selectedState = reducer(state, {type: SHOW_COLOR_PICKER, id: pegIndex});
	return reducer(selectedState, {type: CHOOSE_COLOR_AND_ADVANCE, name: color});
};

describe('mastermind reducer', () => {
	it('creates the initial intro state', () => {
		const state = initState();

		expect(state.gameStatus).toBe('intro');
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
		const playingState = reducer(initialState, {type: START_GAME});

		expect(playingState.gameStatus).toBe('playing');
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

		const feedbackState = reducer(state, {type: SUBMIT_ROW});

		expect(feedbackState.board[0].feedback).toEqual(['red', 'red', 'white', 'none']);
		expect(feedbackState.activeRow).toBe(1);
		expect(feedbackState.showColorpicker).toBe(false);
	});

	it('wins when the active row matches the secret code', () => {
		const initialState = initState();
		const state = {
			...initialState,
			gameStatus: 'playing',
			secretCode: ['yellow', 'green', 'blue', 'pink'],
			board: [
				{
					pegs: ['yellow', 'green', 'blue', 'pink'],
					feedback: ['none', 'none', 'none', 'none']
				},
				...initialState.board.slice(1)
			]
		};

		const wonState = reducer(state, {type: SUBMIT_ROW});

		expect(wonState.gameStatus).toBe('won');
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
			gameStatus: 'playing',
			secretCode: ['silver', 'white', 'red', 'orange'],
			board
		};

		const lostState = reducer(state, {type: SUBMIT_ROW});

		expect(lostState.gameStatus).toBe('lost');
		expect(lostState.isCodeHidden).toBe(false);
		expect(lostState.activeRow).toBe(lastRow);
		expect(lostState.board[lastRow].feedback).toEqual(['none', 'none', 'none', 'none']);
	});

	it('reveals the code and marks the game as gave up', () => {
		const gaveUpState = reducer(reducer(initState(), {type: START_GAME}), {type: GIVE_UP});

		expect(gaveUpState.gameStatus).toBe('gave_up');
		expect(gaveUpState.isCodeHidden).toBe(false);
		expect(gaveUpState.isRevealHidden).toBe(true);
		expect(gaveUpState.showColorpicker).toBe(false);
	});

	it('resets game progress and returns to the intro', () => {
		const playingState = reducer(reducer(initState(), {type: START_GAME}), {type: BEGIN_NEW_ROW});
		const resetState = reducer(playingState, {type: RESET_ALL});

		expect(resetState.gameStatus).toBe('intro');
		expect(resetState.activeRow).toBe(0);
		expect(resetState.isCodeHidden).toBe(true);
		expect(resetState.showColorpicker).toBe(false);
		expect(resetState.board).toHaveLength(NUM_ROWS);
		expect(resetState.board[0].pegs).toEqual(['select', 'select', 'select', 'select']);
	});
});
