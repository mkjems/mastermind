import type {GameStatus} from './gameStatus';

export type Color =
	| 'yellow'
	| 'green'
	| 'pink'
	| 'silver'
	| 'blue'
	| 'white'
	| 'red'
	| 'orange';

// A hole on the board: a placed color, an empty hole, or an empty hole in the
// active row that is awaiting a color ('select').
export type PegValue = Color | 'none' | 'select';

// A feedback dot: exact match, color-only match, or nothing.
export type FeedbackPeg = 'red' | 'white' | 'none';

export interface Row {
	pegs: PegValue[];
	feedback: FeedbackPeg[];
}

export type Board = Row[];

export interface GameState {
	board: Board;
	secretCode: Color[];
	activeRow: number;
	selectedPeg: number | undefined;
	showColorPicker: boolean;
	gameStatus: GameStatus;
	isRulesHidden: boolean;
}
