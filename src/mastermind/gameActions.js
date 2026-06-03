export const INIT = '@@INIT';

export const SHOW_COLOR_PICKER = 'SHOW_COLOR_PICKER';
export const CHOOSE_COLOR_AND_ADVANCE = 'CHOOSE_COLOR_AND_ADVANCE';
export const SUBMIT_ROW = 'SUBMIT_ROW';
export const START_GAME = 'START_GAME';
export const RESET_ALL = 'RESET_ALL';
export const GIVE_UP = 'GIVE_UP';
export const TOGGLE_RULES = 'TOGGLE_RULES';

export const CHOSE_THIS_COLOR = 'CHOSE_THIS_COLOR';
export const ADVANCE_SELECTOR = 'ADVANCE_SELECTOR';
export const GIVE_FEEDBACK = 'GIVE_FEEDBACK';
export const HIDE_COLOR_PICKER = 'HIDE_COLOR_PICKER';
export const BEGIN_NEW_ROW = 'BEGIN_NEW_ROW';
export const RESET_GAME = 'RESET_GAME';
export const RANDOMIZE_SECRET_CODE = 'RANDOMIZE_SECRET_CODE';
export const REVEAL_SECRET_CODE = 'REVEAL_SECRET_CODE';
export const GAME_BEGIN = 'GAME_BEGIN';
export const GAME_WIN = 'GAME_WIN';
export const GAME_LOSE = 'GAME_LOSE';
export const GAME_GIVE_UP = 'GAME_GIVE_UP';
export const GAME_INTRO = 'GAME_INTRO';

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
export const beginNewRow = () => ({type: BEGIN_NEW_ROW});
