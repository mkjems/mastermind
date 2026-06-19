export const GAME_STATUS_INTRO = 'intro';
export const GAME_STATUS_PLAYING = 'playing';
export const GAME_STATUS_WON = 'won';
export const GAME_STATUS_LOST = 'lost';
export const GAME_STATUS_GAVE_UP = 'gave_up';

export const EVENT_START = 'START';
export const EVENT_WIN = 'WIN';
export const EVENT_LOSE = 'LOSE';
export const EVENT_GIVE_UP = 'GIVE_UP';
export const EVENT_RESET = 'RESET';

const TRANSITIONS = {
	[GAME_STATUS_INTRO]: {[EVENT_START]: GAME_STATUS_PLAYING},
	[GAME_STATUS_PLAYING]: {
		[EVENT_WIN]: GAME_STATUS_WON,
		[EVENT_LOSE]: GAME_STATUS_LOST,
		[EVENT_GIVE_UP]: GAME_STATUS_GAVE_UP
	},
	[GAME_STATUS_WON]: {},
	[GAME_STATUS_LOST]: {},
	[GAME_STATUS_GAVE_UP]: {}
};

// EVENT_RESET returns to the intro from anywhere. Any other event follows the
// table and is ignored (status unchanged) when it isn't valid for the current
// status, so illegal transitions simply can't happen.
export const nextStatus = (status, event) => {
	if (event === EVENT_RESET) {
		return GAME_STATUS_INTRO;
	}
	return TRANSITIONS[status]?.[event] ?? status;
};

const TERMINAL_STATUSES = [GAME_STATUS_WON, GAME_STATUS_LOST, GAME_STATUS_GAVE_UP];

// Derived view flags — computed from the status, never stored, so they cannot
// drift out of sync with it.
export const isGameOver = (status) => TERMINAL_STATUSES.includes(status);
export const isCodeHidden = (status) => !isGameOver(status);
export const canGiveUp = (status) => status === GAME_STATUS_PLAYING;
