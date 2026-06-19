import {createContext, useContext} from 'react';
import type {GameStatus} from './gameStatus';
import type {Board, Color, GameMode} from './types';

// The whole-game view state and action handlers that App provides once and any
// gameplay component reads via useGame(). Per-instance values (a row's pegs, a
// peg's id) are passed as explicit props instead — only global state lives here.
export interface GameContextValue {
	mode: GameMode;
	board: Board;
	activeRow: number;
	selectedPeg: number | undefined;
	showColorPicker: boolean;
	secretCode: Color[];
	gameStatus: GameStatus;
	isCodeHidden: boolean;
	canGiveUp: boolean;
	isCompleteRow: boolean;
	onPegClick: (id: number) => void;
	onChooseColor: (name: Color) => void;
	onSubmitRow: () => void;
	onGiveUp: () => void;
	onResetAll: () => void;
}

export const GameContext = createContext<GameContextValue | null>(null);

export const useGame = (): GameContextValue => {
	const value = useContext(GameContext);
	if (value === null) {
		throw new Error('useGame must be used within a GameContext provider');
	}
	return value;
};
