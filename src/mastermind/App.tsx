import React from 'react';
import type {Dispatch} from 'react';
import Gameplay from './components/Gameplay';
import Intro from './components/Intro';
import AlgorithmGame from './components/AlgorithmGame';

import {GameContext} from './GameContext';
import type {GameContextValue} from './GameContext';
import {clearState} from './script/sessionStorage';
import {
    chooseColorAndAdvance,
    confirmSecret,
    giveUp,
    resetAll,
    showColorPicker as showColorPickerAction,
    startAlgorithm,
    startGame,
    submitFeedback,
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
    const {board, showColorPicker, activeRow, selectedPeg, secretCode, gameStatus, isRulesHidden, mode} = state;

    if (gameStatus === GAME_STATUS_INTRO) {
        return (
            <div>
                <Intro
                    isRulesHidden={isRulesHidden}
                    onToggleRules={() => dispatch(toggleRules())}
                    onStartGame={() => dispatch(startGame())}
                    onStartAlgorithm={() => dispatch(startAlgorithm())}
                />
            </div>
        );
    }

    const isCompleteRow = board[activeRow].pegs.every((peg) => peg !== 'select' && peg !== 'none');

    const game: GameContextValue = {
        mode,
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
        },
        onConfirmSecret: (secret) => dispatch(confirmSecret(secret)),
        onSubmitFeedback: (feedback) => dispatch(submitFeedback(feedback))
    };

    return (
        <div>
            <GameContext.Provider value={game}>
                {mode === 'algorithm' ? <AlgorithmGame /> : <Gameplay />}
            </GameContext.Provider>
        </div>
    );
}

export default App;
