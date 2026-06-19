import {
	EVENT_CONFIRM_SECRET,
	EVENT_GIVE_UP,
	EVENT_RESET,
	EVENT_START,
	EVENT_START_ALGORITHM,
	GAME_STATUS_INTRO,
	nextStatus
} from '../gameStatus';
import type {GameEvent, GameStatus} from '../gameStatus';
import {
	CHOOSE_COLOR_AND_ADVANCE,
	CONFIRM_SECRET,
	GIVE_UP,
	RESET_ALL,
	SHOW_COLOR_PICKER,
	START_ALGORITHM,
	START_GAME,
	SUBMIT_FEEDBACK,
	SUBMIT_ROW,
	TOGGLE_RULES
} from '../gameActions';
import type {DecoratedAction} from '../gameActions';
import type {GameMode} from '../types';

// Map a dispatched action to the game-machine event it triggers. SUBMIT_ROW's
// event (win/lose/none) is decided once in the root reducer and carried on the
// action; everything else maps to a fixed event.
const eventForAction = (action: DecoratedAction): GameEvent | null => {
	switch (action.type) {
		case START_GAME:
			return EVENT_START;
		case START_ALGORITHM:
			return EVENT_START_ALGORITHM;
		case GIVE_UP:
			return EVENT_GIVE_UP;
		case RESET_ALL:
			return EVENT_RESET;
		case CONFIRM_SECRET:
			return EVENT_CONFIRM_SECRET;
		case SUBMIT_ROW:
		case SUBMIT_FEEDBACK:
			return action.event ?? null;
		default:
			return null;
	}
};

export const gameStatusReducer = (state: GameStatus = GAME_STATUS_INTRO, action: DecoratedAction): GameStatus => {
	const event = eventForAction(action);
	return event ? nextStatus(state, event) : state;
};

export const selectedPegReducer = (state: number | undefined = undefined, action: DecoratedAction): number | undefined => {
	switch (action.type) {
		case SHOW_COLOR_PICKER:
			return action.id;
		case CHOOSE_COLOR_AND_ADVANCE:
			return action.nextSelectedPeg;
		case SUBMIT_ROW:
		case START_GAME:
		case RESET_ALL:
			return undefined;
		default:
			return state;
	}
};

export const activeRowReducer = (state = 0, action: DecoratedAction): number => {
	switch (action.type) {
		case SUBMIT_ROW:
		case SUBMIT_FEEDBACK:
			return action.activeRow ?? state;
		case CONFIRM_SECRET:
		case RESET_ALL:
			return 0;
		default:
			return state;
	}
};

export const showColorPickerReducer = (state = false, action: DecoratedAction): boolean => {
	switch (action.type) {
		case SHOW_COLOR_PICKER:
			return true;
		case SUBMIT_ROW:
		case GIVE_UP:
		case START_GAME:
		case RESET_ALL:
			return false;
		default:
			return state;
	}
};

export const isRulesHiddenReducer = (state = true, action: DecoratedAction): boolean => {
	switch (action.type) {
		case TOGGLE_RULES:
			return !state;
		default:
			return state;
	}
};

export const modeReducer = (state: GameMode = 'human', action: DecoratedAction): GameMode => {
	switch (action.type) {
		case START_ALGORITHM:
			return 'algorithm';
		case START_GAME:
		case RESET_ALL:
			return 'human';
		default:
			return state;
	}
};
