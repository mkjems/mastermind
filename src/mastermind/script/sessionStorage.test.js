// @vitest-environment jsdom
import {beforeEach, describe, expect, it, vi} from 'vitest';

import {clearState, loadState, saveState} from './sessionStorage.js';
import {
	GAME_STATUS_LOST,
	GAME_STATUS_PLAYING,
	GAME_STATUS_WON
} from '../gameStatus.js';

describe('sessionStorage state helpers', () => {
	beforeEach(() => {
		sessionStorage.clear();
		vi.restoreAllMocks();
	});

	it('returns undefined when no state has been saved', () => {
		expect(loadState()).toBeUndefined();
	});

	it('loads valid JSON state', () => {
		const state = {gameStatus: GAME_STATUS_PLAYING, activeRow: 2};

		sessionStorage.setItem('state', JSON.stringify(state));

		expect(loadState()).toEqual(state);
	});

	it('returns undefined for invalid JSON', () => {
		sessionStorage.setItem('state', '{not json');

		expect(loadState()).toBeUndefined();
	});

	it('saves state as JSON', () => {
		const state = {gameStatus: GAME_STATUS_WON};

		saveState(state);

		expect(sessionStorage.getItem('state')).toBe(JSON.stringify(state));
	});

	it('clears saved state', () => {
		sessionStorage.setItem('state', JSON.stringify({gameStatus: GAME_STATUS_LOST}));

		clearState();

		expect(sessionStorage.getItem('state')).toBeNull();
	});
});
