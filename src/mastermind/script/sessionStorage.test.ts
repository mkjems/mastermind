// @vitest-environment jsdom
import {beforeEach, describe, expect, it, vi} from 'vitest';

import {clearState, loadState, saveState, STORAGE_KEY} from './sessionStorage';
import {
	GAME_STATUS_LOST,
	GAME_STATUS_PLAYING,
	GAME_STATUS_WON
} from '../gameStatus';
import type {GameState} from '../types';

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

		sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));

		expect(loadState()).toEqual(state);
	});

	it('returns undefined for invalid JSON', () => {
		sessionStorage.setItem(STORAGE_KEY, '{not json');

		expect(loadState()).toBeUndefined();
	});

	it('saves state as JSON', () => {
		const state = {gameStatus: GAME_STATUS_WON} as GameState;

		saveState(state);

		expect(sessionStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify(state));
	});

	it('clears saved state', () => {
		sessionStorage.setItem(STORAGE_KEY, JSON.stringify({gameStatus: GAME_STATUS_LOST}));

		clearState();

		expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
	});
});
