import {describe, expect, it} from 'vitest';

import {
	canGiveUp,
	EVENT_GIVE_UP,
	EVENT_LOSE,
	EVENT_RESET,
	EVENT_START,
	EVENT_WIN,
	GAME_STATUS_GAVE_UP,
	GAME_STATUS_INTRO,
	GAME_STATUS_LOST,
	GAME_STATUS_PLAYING,
	GAME_STATUS_WON,
	isCodeHidden,
	isGameOver,
	nextStatus
} from './gameStatus.js';

describe('nextStatus', () => {
	it('starts a game from the intro', () => {
		expect(nextStatus(GAME_STATUS_INTRO, EVENT_START)).toBe(GAME_STATUS_PLAYING);
	});

	it('resolves a game from playing', () => {
		expect(nextStatus(GAME_STATUS_PLAYING, EVENT_WIN)).toBe(GAME_STATUS_WON);
		expect(nextStatus(GAME_STATUS_PLAYING, EVENT_LOSE)).toBe(GAME_STATUS_LOST);
		expect(nextStatus(GAME_STATUS_PLAYING, EVENT_GIVE_UP)).toBe(GAME_STATUS_GAVE_UP);
	});

	it('ignores events that are not valid for the current status', () => {
		// Can't win before starting, can't start again once won, can't give up after losing.
		expect(nextStatus(GAME_STATUS_INTRO, EVENT_WIN)).toBe(GAME_STATUS_INTRO);
		expect(nextStatus(GAME_STATUS_WON, EVENT_START)).toBe(GAME_STATUS_WON);
		expect(nextStatus(GAME_STATUS_LOST, EVENT_GIVE_UP)).toBe(GAME_STATUS_LOST);
	});

	it('returns to the intro on reset from any status', () => {
		[
			GAME_STATUS_PLAYING,
			GAME_STATUS_WON,
			GAME_STATUS_LOST,
			GAME_STATUS_GAVE_UP
		].forEach((status) => {
			expect(nextStatus(status, EVENT_RESET)).toBe(GAME_STATUS_INTRO);
		});
	});
});

describe('derived status flags', () => {
	it('treats only the resolved statuses as game over', () => {
		expect(isGameOver(GAME_STATUS_INTRO)).toBe(false);
		expect(isGameOver(GAME_STATUS_PLAYING)).toBe(false);
		expect(isGameOver(GAME_STATUS_WON)).toBe(true);
		expect(isGameOver(GAME_STATUS_LOST)).toBe(true);
		expect(isGameOver(GAME_STATUS_GAVE_UP)).toBe(true);
	});

	it('hides the code until the game is over', () => {
		expect(isCodeHidden(GAME_STATUS_PLAYING)).toBe(true);
		expect(isCodeHidden(GAME_STATUS_WON)).toBe(false);
	});

	it('allows giving up only while playing', () => {
		expect(canGiveUp(GAME_STATUS_PLAYING)).toBe(true);
		expect(canGiveUp(GAME_STATUS_INTRO)).toBe(false);
		expect(canGiveUp(GAME_STATUS_LOST)).toBe(false);
	});
});
