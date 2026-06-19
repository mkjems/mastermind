import React from 'react';
import Gameplay from './components/Gameplay';
import Intro from './components/Intro';

import {clearState} from './script/sessionStorage.js';
import {
    chooseColorAndAdvance,
    giveUp,
    resetAll,
    showColorPicker as showColorPickerAction,
    startGame,
    submitRow,
    toggleRules
} from './gameActions.js';
import {canGiveUp, GAME_STATUS_INTRO, isCodeHidden} from './gameStatus.js';

function App({state, dispatch}) {
    const {board, showColorPicker, activeRow, selectedPeg, secretCode, gameStatus, isRulesHidden} = state;

    const remaining = board[activeRow].pegs.filter((peg) => {
        return peg === 'select' || peg === 'none';
    }).length;

    const props = {
        isCompleteRow: (remaining === 0),
        board,
        showColorPicker,
        activeRow,
        selectedPeg,
        onPegClick: (id) => {
            dispatch(showColorPickerAction(id));
        },
        onChooseColor: (name) => {
            dispatch(chooseColorAndAdvance(name));
        },
        onSubmitRow: () => {
            dispatch(submitRow());
        },
        secretCode,
        isCodeHidden: isCodeHidden(gameStatus),
        gameStatus,
        onResetAll: ()=>{
            dispatch(resetAll());
            clearState();
        },
        onGiveUp: () => {
            dispatch(giveUp());
        },
        canGiveUp: canGiveUp(gameStatus)
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
