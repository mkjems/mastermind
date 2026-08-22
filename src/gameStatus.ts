export const GAME_STATUS_INTRO = "intro";
export const GAME_STATUS_PLAYING = "playing";
export const GAME_STATUS_WON = "won";
export const GAME_STATUS_LOST = "lost";
export const GAME_STATUS_GAVE_UP = "gave_up";
// Algorithm mode: the human sets a secret, then scores the computer's guesses.
export const GAME_STATUS_ALGO_SETUP = "algo_setup";
export const GAME_STATUS_ALGO_GUESSING = "algo_guessing";
export const GAME_STATUS_ALGO_SOLVED = "algo_solved";
export const GAME_STATUS_ALGO_FAILED = "algo_failed";

export type GameStatus =
  | typeof GAME_STATUS_INTRO
  | typeof GAME_STATUS_PLAYING
  | typeof GAME_STATUS_WON
  | typeof GAME_STATUS_LOST
  | typeof GAME_STATUS_GAVE_UP
  | typeof GAME_STATUS_ALGO_SETUP
  | typeof GAME_STATUS_ALGO_GUESSING
  | typeof GAME_STATUS_ALGO_SOLVED
  | typeof GAME_STATUS_ALGO_FAILED;

export const EVENT_START = "START";
export const EVENT_WIN = "WIN";
export const EVENT_LOSE = "LOSE";
export const EVENT_GIVE_UP = "GIVE_UP";
export const EVENT_RESET = "RESET";
export const EVENT_START_ALGORITHM = "START_ALGORITHM";
export const EVENT_CONFIRM_SECRET = "CONFIRM_SECRET";
export const EVENT_SOLVED = "SOLVED";
export const EVENT_FAILED = "FAILED";

export type GameEvent =
  | typeof EVENT_START
  | typeof EVENT_WIN
  | typeof EVENT_LOSE
  | typeof EVENT_GIVE_UP
  | typeof EVENT_RESET
  | typeof EVENT_START_ALGORITHM
  | typeof EVENT_CONFIRM_SECRET
  | typeof EVENT_SOLVED
  | typeof EVENT_FAILED;

const TRANSITIONS: Record<
  GameStatus,
  Partial<Record<GameEvent, GameStatus>>
> = {
  [GAME_STATUS_INTRO]: {
    [EVENT_START]: GAME_STATUS_PLAYING,
    [EVENT_START_ALGORITHM]: GAME_STATUS_ALGO_SETUP,
  },
  [GAME_STATUS_PLAYING]: {
    [EVENT_WIN]: GAME_STATUS_WON,
    [EVENT_LOSE]: GAME_STATUS_LOST,
    [EVENT_GIVE_UP]: GAME_STATUS_GAVE_UP,
  },
  [GAME_STATUS_WON]: {},
  [GAME_STATUS_LOST]: {},
  [GAME_STATUS_GAVE_UP]: {},
  [GAME_STATUS_ALGO_SETUP]: {
    [EVENT_CONFIRM_SECRET]: GAME_STATUS_ALGO_GUESSING,
  },
  [GAME_STATUS_ALGO_GUESSING]: {
    [EVENT_SOLVED]: GAME_STATUS_ALGO_SOLVED,
    [EVENT_FAILED]: GAME_STATUS_ALGO_FAILED,
  },
  [GAME_STATUS_ALGO_SOLVED]: {},
  [GAME_STATUS_ALGO_FAILED]: {},
};

// EVENT_RESET returns to the intro from anywhere. Any other event follows the
// table and is ignored (status unchanged) when it isn't valid for the current
// status, so illegal transitions simply can't happen.
export const nextStatus = (
  status: GameStatus,
  event: GameEvent,
): GameStatus => {
  if (event === EVENT_RESET) {
    return GAME_STATUS_INTRO;
  }
  return TRANSITIONS[status]?.[event] ?? status;
};

const TERMINAL_STATUSES: GameStatus[] = [
  GAME_STATUS_WON,
  GAME_STATUS_LOST,
  GAME_STATUS_GAVE_UP,
  GAME_STATUS_ALGO_SOLVED,
  GAME_STATUS_ALGO_FAILED,
];

// Derived view flags — computed from the status, never stored, so they cannot
// drift out of sync with it.
export const isGameOver = (status: GameStatus): boolean =>
  TERMINAL_STATUSES.includes(status);
export const isCodeHidden = (status: GameStatus): boolean =>
  !isGameOver(status);
export const canGiveUp = (status: GameStatus): boolean =>
  status === GAME_STATUS_PLAYING;
