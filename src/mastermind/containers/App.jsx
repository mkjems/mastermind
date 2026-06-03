import React from 'react';
import Gameplay from '../components/Gameplay';
import Intro from '../components/Intro';

import {clearState} from '../script/localStorage';

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
            dispatch({type: 'SHOW_COLOR_PICKER', id});
        },
        onChooseColor: (name) => {
            dispatch({type: 'CHOOSE_COLOR_AND_ADVANCE', name});
        },
        onSubmitRow: () => {
            dispatch({type: 'SUBMIT_ROW'});
        },
        secretCode,
        isCodeHidden,
        gameStatus,
        onResetAll: ()=>{
            dispatch({type: 'RESET_ALL'});
            clearState();
        },
        onGiveUp: () => {
            dispatch({type: 'GIVE_UP'});
        },
        isRevealHidden
    };

    const onStartGame = () => {
        dispatch({type: 'START_GAME'});
    };

    const onToggleRules = () => {
        dispatch({type: 'TOGGLE_RULES'});
    };

    return (
        <div>
            {gameStatus !== 'intro' ? <Gameplay {...props} /> : null}
            {gameStatus === 'intro' ? <Intro isRulesHidden={isRulesHidden} onToggleRules={onToggleRules} onStartGame={onStartGame} /> : null}
        </div>
    );
}

export default App;
