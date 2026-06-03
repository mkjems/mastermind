import React from 'react';
import Gameplay from '../components/Gameplay';
import Intro from '../components/Intro';

import { clearState } from '../script/localStorage';
import reducer from '../reducers';

import {
    gameBegin,
    gameGiveUp,
    gameWin,
    gameLoose,
    onPegClick,
    onChooseColor,
    beginNewRow,
    hideColorPicker,
    giveFeedback,
    onAdvanceSelector,
    resetGame,
    revealSecretCode,
    randomizeCode,
    gameIntro,
    toggleRules
} from '../actions';

import {NUM_ROWS} from '../script/constants';

function App({state, dispatch}) {
    const {board, showColorpicker, activeRow, selectedPeg, secretCode, isCodeHidden, gameStatus, isRulesHidden, isRevealHidden} = state;

    const remaining = board[activeRow].pegs.filter((val)=>{
        return (val =='select' || val == 'none');
    }).length;

    const props = {
        isCompleteRow: (remaining === 0),
        board,
        showColorpicker,
        activeRow,
        selectedPeg,
        onPegClick: (id) => {
            dispatch(onPegClick(id));
        },
        onChooseColor: (name) => {
            const chooseColorAction = onChooseColor(name);
            const nextState = reducer(state, chooseColorAction);

            dispatch(chooseColorAction);
            dispatch(onAdvanceSelector(nextState.board[nextState.activeRow].pegs));
        },
        onSubmitRow: () => {
            const giveFeedbackAction = giveFeedback();
            const nextState = reducer(state, giveFeedbackAction);
            const didSolveCode = nextState.board[nextState.activeRow].feedback.reduce((acc, val) => {
                return acc && (val === 'red');
            }, true);

            dispatch(giveFeedbackAction);
            dispatch(hideColorPicker());
            if(didSolveCode){
                console.log('You solved it');
                dispatch(gameWin());
            } else {
                if (NUM_ROWS != (nextState.activeRow+1)) {
                    dispatch(beginNewRow());
                    return;
                }
                console.log('You loose');
                dispatch(revealSecretCode());
                dispatch(gameLoose());
            }
            dispatch(revealSecretCode());
        },
        secretCode,
        isCodeHidden,
        gameStatus,
        onResetAll: ()=>{
            dispatch(gameIntro());
            dispatch(resetGame());
            clearState();
        },
        onGiveUp: () => {
            dispatch(revealSecretCode());
            dispatch(hideColorPicker());
            dispatch(gameGiveUp());
        },
        isRevealHidden
    }

    const onStartGame = () => {
        console.log('startGame');
        dispatch(randomizeCode());
        dispatch(gameBegin());
    }
    const onToggleRules = () => {
        dispatch(toggleRules());
    }

    return (
        <div>
            {(gameStatus!='intro') ? <Gameplay {...props} /> : null}
            {(gameStatus=='intro') ? <Intro isRulesHidden={isRulesHidden} onToggleRules={onToggleRules} onStartGame={onStartGame} /> : null}
        </div>
    )
}

export default App;
