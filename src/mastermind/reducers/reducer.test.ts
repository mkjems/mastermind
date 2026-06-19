import {describe, expect, it} from 'vitest';

import reducer from './index';
import {NUM_ROWS, PEG_COLORS} from '../script/constants';
import {
	chooseColorAndAdvance,
	giveUp,
	init,
	resetAll,
	showColorPicker,
	startAlgorithm,
	startGame,
	submitRow
} from '../gameActions';
import {
	canGiveUp,
	GAME_STATUS_ALGO_SETUP,
	GAME_STATUS_GAVE_UP,
	GAME_STATUS_INTRO,
	GAME_STATUS_LOST,
	GAME_STATUS_PLAYING,
	GAME_STATUS_WON,
	isCodeHidden
} from '../gameStatus';
import type {Color, GameState, Row} from '../types';

const initState = (): GameState => reducer(undefined, init());

const chooseColor = (state: GameState, pegIndex: number, color: Color): GameState => {
	const selectedState = reducer(state, showColorPicker(pegIndex));
	return reducer(selectedState, chooseColorAndAdvance(color));
};

describe('mastermind reducer', () => {
	it('creates the initial intro state', () => {
		const state = initState();

		expect(state.gameStatus).toBe(GAME_STATUS_INTRO);
		expect(state.mode).toBe('human');
		expect(state.activeRow).toBe(0);
		expect(isCodeHidden(state.gameStatus)).toBe(true);
		expect(state.isRulesHidden).toBe(true);
		expect(state.showColorPicker).toBe(false);
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

	it('enters algorithm mode from the intro', () => {
		const state = reducer(initState(), startAlgorithm());

		expect(state.mode).toBe('algorithm');
		expect(state.gameStatus).toBe(GAME_STATUS_ALGO_SETUP);
	});

	it('returns to human mode and the intro on reset', () => {
		const algoState = reducer(initState(), startAlgorithm());
		const resetState = reducer(algoState, resetAll());

		expect(resetState.mode).toBe('human');
		expect(resetState.gameStatus).toBe(GAME_STATUS_INTRO);
	});

	it('chooses a color and advances the selected peg', () => {
		const state = chooseColor(initState(), 0, 'yellow');

		expect(state.board[0].pegs).toEqual(['yellow', 'select', 'select', 'select']);
		expect(state.selectedPeg).toBe(1);
		expect(state.showColorPicker).toBe(true);
	});

	it('gives red, white, and empty feedback for a submitted row', () => {
		const initialState = initState();
		const state: GameState = {
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
		expect(feedbackState.showColorPicker).toBe(false);
	});

	it('makes the next row active and selectable after a non-winning submit', () => {
		const initialState = initState();
		const state: GameState = {
			...initialState,
			gameStatus: GAME_STATUS_PLAYING,
			secretCode: ['yellow', 'green', 'blue', 'pink'],
			board: [
				{
					pegs: ['yellow', 'blue', 'silver', 'pink'],
					feedback: ['none', 'none', 'none', 'none']
				},
				...initialState.board.slice(1)
			]
		};

		const nextState = reducer(state, submitRow());

		expect(nextState.activeRow).toBe(1);
		expect(nextState.board[1].pegs).toEqual(['select', 'select', 'select', 'select']);
		expect(nextState.board[0].pegs).toEqual(['yellow', 'blue', 'silver', 'pink']);
	});

	it('wins when the active row matches the secret code', () => {
		const initialState = initState();
		const state: GameState = {
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
		expect(isCodeHidden(wonState.gameStatus)).toBe(false);
		expect(canGiveUp(wonState.gameStatus)).toBe(false);
		expect(wonState.board[0].feedback).toEqual(['red', 'red', 'red', 'red']);
	});

	it('loses when the last row does not match the secret code', () => {
		const initialState = initState();
		const lastRow = NUM_ROWS - 1;
		const board = initialState.board.map((row, index): Row => {
			if (index !== lastRow) {
				return row;
			}

			return {
				pegs: ['yellow', 'green', 'blue', 'pink'],
				feedback: ['none', 'none', 'none', 'none']
			};
		});
		const state: GameState = {
			...initialState,
			activeRow: lastRow,
			gameStatus: GAME_STATUS_PLAYING,
			secretCode: ['silver', 'white', 'red', 'orange'],
			board
		};

		const lostState = reducer(state, submitRow());

		expect(lostState.gameStatus).toBe(GAME_STATUS_LOST);
		expect(isCodeHidden(lostState.gameStatus)).toBe(false);
		expect(canGiveUp(lostState.gameStatus)).toBe(false);
		expect(lostState.activeRow).toBe(lastRow);
		expect(lostState.board[lastRow].feedback).toEqual(['none', 'none', 'none', 'none']);
	});

	it('reveals the code and marks the game as gave up', () => {
		const gaveUpState = reducer(reducer(initState(), startGame()), giveUp());

		expect(gaveUpState.gameStatus).toBe(GAME_STATUS_GAVE_UP);
		expect(isCodeHidden(gaveUpState.gameStatus)).toBe(false);
		expect(canGiveUp(gaveUpState.gameStatus)).toBe(false);
		expect(gaveUpState.showColorPicker).toBe(false);
	});

	it('resets game progress and returns to the intro', () => {
		const playingState = reducer(reducer(initState(), startGame()), submitRow());
		const resetState = reducer(playingState, resetAll());

		expect(playingState.activeRow).toBe(1);
		expect(resetState.gameStatus).toBe(GAME_STATUS_INTRO);
		expect(resetState.activeRow).toBe(0);
		expect(isCodeHidden(resetState.gameStatus)).toBe(true);
		expect(resetState.showColorPicker).toBe(false);
		expect(resetState.board).toHaveLength(NUM_ROWS);
		expect(resetState.board[0].pegs).toEqual(['select', 'select', 'select', 'select']);
	});
});
