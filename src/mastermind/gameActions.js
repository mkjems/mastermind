export const INIT = '@@INIT';

export const SHOW_COLOR_PICKER = 'SHOW_COLOR_PICKER';
export const CHOOSE_COLOR_AND_ADVANCE = 'CHOOSE_COLOR_AND_ADVANCE';
export const SUBMIT_ROW = 'SUBMIT_ROW';
export const START_GAME = 'START_GAME';
export const RESET_ALL = 'RESET_ALL';
export const GIVE_UP = 'GIVE_UP';
export const TOGGLE_RULES = 'TOGGLE_RULES';

export const init = () => ({type: INIT});
export const showColorPicker = (id) => ({type: SHOW_COLOR_PICKER, id});
export const chooseColorAndAdvance = (name) => ({
	type: CHOOSE_COLOR_AND_ADVANCE,
	name
});
export const submitRow = () => ({type: SUBMIT_ROW});
export const startGame = () => ({type: START_GAME});
export const resetAll = () => ({type: RESET_ALL});
export const giveUp = () => ({type: GIVE_UP});
export const toggleRules = () => ({type: TOGGLE_RULES});
