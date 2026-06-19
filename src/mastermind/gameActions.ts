import type {Color, FeedbackPeg, PegValue} from './types';
import type {GameEvent} from './gameStatus';

export const INIT = '@@INIT';

export const SHOW_COLOR_PICKER = 'SHOW_COLOR_PICKER';
export const CHOOSE_COLOR_AND_ADVANCE = 'CHOOSE_COLOR_AND_ADVANCE';
export const SUBMIT_ROW = 'SUBMIT_ROW';
export const START_GAME = 'START_GAME';
export const RESET_ALL = 'RESET_ALL';
export const GIVE_UP = 'GIVE_UP';
export const TOGGLE_RULES = 'TOGGLE_RULES';

export interface InitAction {
	type: typeof INIT;
}
export interface ShowColorPickerAction {
	type: typeof SHOW_COLOR_PICKER;
	id: number;
}
export interface ChooseColorAndAdvanceAction {
	type: typeof CHOOSE_COLOR_AND_ADVANCE;
	name: Color;
}
export interface SubmitRowAction {
	type: typeof SUBMIT_ROW;
}
export interface StartGameAction {
	type: typeof START_GAME;
}
export interface ResetAllAction {
	type: typeof RESET_ALL;
}
export interface GiveUpAction {
	type: typeof GIVE_UP;
}
export interface ToggleRulesAction {
	type: typeof TOGGLE_RULES;
}

export type Action =
	| InitAction
	| ShowColorPickerAction
	| ChooseColorAndAdvanceAction
	| SubmitRowAction
	| StartGameAction
	| ResetAllAction
	| GiveUpAction
	| ToggleRulesAction;

// Context the root reducer derives from the previous state and attaches to the
// action before the slice reducers run. All optional: each slice reads only the
// fields relevant to the action it handles.
export interface ActionDecorations {
	activeRow?: number;
	selectedPeg?: number;
	pegs?: PegValue[];
	nextSelectedPeg?: number;
	submittedRow?: number;
	feedback?: FeedbackPeg[];
	event?: GameEvent | null;
	continues?: boolean;
}

export type DecoratedAction = Action & ActionDecorations;

export const init = (): InitAction => ({type: INIT});
export const showColorPicker = (id: number): ShowColorPickerAction => ({type: SHOW_COLOR_PICKER, id});
export const chooseColorAndAdvance = (name: Color): ChooseColorAndAdvanceAction => ({
	type: CHOOSE_COLOR_AND_ADVANCE,
	name
});
export const submitRow = (): SubmitRowAction => ({type: SUBMIT_ROW});
export const startGame = (): StartGameAction => ({type: START_GAME});
export const resetAll = (): ResetAllAction => ({type: RESET_ALL});
export const giveUp = (): GiveUpAction => ({type: GIVE_UP});
export const toggleRules = (): ToggleRulesAction => ({type: TOGGLE_RULES});
