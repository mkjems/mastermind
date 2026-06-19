import {describe, expect, it} from 'vitest';

import {
	chooseColorAndAdvance,
	CHOOSE_COLOR_AND_ADVANCE,
	giveUp,
	GIVE_UP,
	init,
	INIT,
	resetAll,
	RESET_ALL,
	showColorPicker,
	SHOW_COLOR_PICKER,
	startGame,
	START_GAME,
	submitRow,
	SUBMIT_ROW,
	toggleRules,
	TOGGLE_RULES
} from './gameActions';

describe('game action creators', () => {
	it('creates initialization action', () => {
		expect(init()).toEqual({type: INIT});
	});

	it('creates player intent actions', () => {
		expect(showColorPicker(2)).toEqual({type: SHOW_COLOR_PICKER, id: 2});
		expect(chooseColorAndAdvance('yellow')).toEqual({
			type: CHOOSE_COLOR_AND_ADVANCE,
			name: 'yellow'
		});
		expect(submitRow()).toEqual({type: SUBMIT_ROW});
		expect(startGame()).toEqual({type: START_GAME});
		expect(resetAll()).toEqual({type: RESET_ALL});
		expect(giveUp()).toEqual({type: GIVE_UP});
		expect(toggleRules()).toEqual({type: TOGGLE_RULES});
	});
});
