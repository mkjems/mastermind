import {describe, expect, it} from 'vitest';

import reducer from './index.js';
import {NUM_ROWS, PEG_COLORS} from '../script/constants.js';

const initState = () => reducer(undefined, {type: '@@INIT'});

const chooseColor = (state, pegIndex, color) => {
	const selectedState = reducer(state, {type: 'SHOW_COLOR_PICKER', id: pegIndex});
	const colorState = reducer(selectedState, {type: 'CHOSE_THIS_COLOR', name: color});

	return reducer(colorState, {
		type: 'ADVANCE_SELECTOR',
		pegs: colorState.board[colorState.activeRow].pegs
	});
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
		const randomizedState = reducer(initialState, {type: 'RANDOMIZE_SECRET_CODE'});
		const playingState = reducer(randomizedState, {type: 'GAME_BEGIN'});

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

		const feedbackState = reducer(state, {type: 'GIVE_FEEDBACK'});

		expect(feedbackState.board[0].feedback).toEqual(['red', 'red', 'white', 'none']);
	});

	it('resets game progress but keeps intro status unless explicitly changed', () => {
		const playingState = reducer(reducer(initState(), {type: 'GAME_BEGIN'}), {type: 'BEGIN_NEW_ROW'});
		const resetState = reducer(playingState, {type: 'RESET_GAME'});

		expect(resetState.gameStatus).toBe('playing');
		expect(resetState.activeRow).toBe(0);
		expect(resetState.isCodeHidden).toBe(true);
		expect(resetState.showColorpicker).toBe(false);
		expect(resetState.board).toHaveLength(NUM_ROWS);
		expect(resetState.board[0].pegs).toEqual(['select', 'select', 'select', 'select']);
	});
});
