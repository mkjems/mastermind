import React from 'react';
import Gameplay from './components/Gameplay';
import Intro from './components/Intro';

import {clearState} from './script/sessionStorage.js';
import {
    chooseColorAndAdvance,
    giveUp,
    resetAll,
    showColorPicker,
    startGame,
    submitRow,
    toggleRules
} from './gameActions.js';
import {GAME_STATUS_INTRO} from './gameStatus.js';

function App({state, dispatch}) {
    const {board, showColorpicker, activeRow, selectedPeg, secretCode, isCodeHidden, gameStatus, isRulesHidden, isRevealHidden} = state;

    const remaining = board[activeRow].pegs.filter((peg) => {
        return peg === 'select' || peg === 'none';
    }).length;

    const props = {
        isCompleteRow: (remaining === 0),
        board,
        showColorpicker,
        activeRow,
        selectedPeg,
        onPegClick: (id) => {
            dispatch(showColorPicker(id));
        },
        onChooseColor: (name) => {
            dispatch(chooseColorAndAdvance(name));
        },
        onSubmitRow: () => {
            dispatch(submitRow());
        },
        secretCode,
        isCodeHidden,
        gameStatus,
        onResetAll: ()=>{
            dispatch(resetAll());
            clearState();
        },
        onGiveUp: () => {
            dispatch(giveUp());
        },
        isRevealHidden
    };

    const onStartGame = () => {
        dispatch(startGame());
    };

    const onToggleRules = () => {
        dispatch(toggleRules());
    };

    return (
        <div>
            {gameStatus !== GAME_STATUS_INTRO ? <Gameplay {...props} /> : null}
            {gameStatus === GAME_STATUS_INTRO ? <Intro isRulesHidden={isRulesHidden} onToggleRules={onToggleRules} onStartGame={onStartGame} /> : null}
        </div>
    );
}

export default App;
