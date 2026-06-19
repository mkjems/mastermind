import React from 'react';
import type {Dispatch} from 'react';
import Gameplay from './components/Gameplay';
import Intro from './components/Intro';

import {GameContext} from './GameContext';
import type {GameContextValue} from './GameContext';
import {clearState} from './script/sessionStorage';
import {
    chooseColorAndAdvance,
    giveUp,
    resetAll,
    showColorPicker as showColorPickerAction,
    startGame,
    submitRow,
    toggleRules
} from './gameActions';
import type {Action} from './gameActions';
import {canGiveUp, GAME_STATUS_INTRO, isCodeHidden} from './gameStatus';
import type {GameState} from './types';

interface AppProps {
    state: GameState;
    dispatch: Dispatch<Action>;
}

function App({state, dispatch}: AppProps) {
    const {board, showColorPicker, activeRow, selectedPeg, secretCode, gameStatus, isRulesHidden} = state;

    const isCompleteRow = board[activeRow].pegs.every((peg) => peg !== 'select' && peg !== 'none');

    const game: GameContextValue = {
        board,
        activeRow,
        selectedPeg,
        showColorPicker,
        secretCode,
        gameStatus,
        isCodeHidden: isCodeHidden(gameStatus),
        canGiveUp: canGiveUp(gameStatus),
        isCompleteRow,
        onPegClick: (id) => dispatch(showColorPickerAction(id)),
        onChooseColor: (name) => dispatch(chooseColorAndAdvance(name)),
        onSubmitRow: () => dispatch(submitRow()),
        onGiveUp: () => dispatch(giveUp()),
        onResetAll: () => {
            dispatch(resetAll());
            clearState();
        }
    };

    return (
        <div>
            {gameStatus !== GAME_STATUS_INTRO ? (
                <GameContext.Provider value={game}>
                    <Gameplay />
                </GameContext.Provider>
            ) : null}
            {gameStatus === GAME_STATUS_INTRO ? (
                <Intro
                    isRulesHidden={isRulesHidden}
                    onToggleRules={() => dispatch(toggleRules())}
                    onStartGame={() => dispatch(startGame())}
                />
            ) : null}
        </div>
    );
}

export default App;
