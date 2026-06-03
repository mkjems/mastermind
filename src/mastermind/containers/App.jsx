import React from 'react';
import Gameplay from '../components/Gameplay';
import Intro from '../components/Intro';

import { clearState } from '../script/localStorage';
import reducer from '../reducers';

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
            dispatch({type: 'SHOW_COLOR_PICKER', id});
        },
        onChooseColor: (name) => {
            const chooseColorAction = {type: 'CHOSE_THIS_COLOR', name};
            const nextState = reducer(state, chooseColorAction);

            dispatch(chooseColorAction);
            dispatch({type: 'ADVANCE_SELECTOR', pegs: nextState.board[nextState.activeRow].pegs});
        },
        onSubmitRow: () => {
            const giveFeedbackAction = {type: 'GIVE_FEEDBACK'};
            const nextState = reducer(state, giveFeedbackAction);
            const didSolveCode = nextState.board[nextState.activeRow].feedback.reduce((acc, val) => {
                return acc && (val === 'red');
            }, true);

            dispatch(giveFeedbackAction);
            dispatch({type: 'HIDE_COLOR_PICKER'});
            if(didSolveCode){
                dispatch({type: 'GAME_WIN'});
            } else {
                if (NUM_ROWS != (nextState.activeRow+1)) {
                    dispatch({type: 'BEGIN_NEW_ROW'});
                    return;
                }
                dispatch({type: 'REVEAL_SECRET_CODE'});
                dispatch({type: 'GAME_LOSE'});
            }
            dispatch({type: 'REVEAL_SECRET_CODE'});
        },
        secretCode,
        isCodeHidden,
        gameStatus,
        onResetAll: ()=>{
            dispatch({type: 'GAME_INTRO'});
            dispatch({type: 'RESET_GAME'});
            clearState();
        },
        onGiveUp: () => {
            dispatch({type: 'REVEAL_SECRET_CODE'});
            dispatch({type: 'HIDE_COLOR_PICKER'});
            dispatch({type: 'GAME_GIVE_UP'});
        },
        isRevealHidden
    }

    const onStartGame = () => {
        dispatch({type: 'RANDOMIZE_SECRET_CODE'});
        dispatch({type: 'GAME_BEGIN'});
    }
    const onToggleRules = () => {
        dispatch({type: 'TOGGLE_RULES'});
    }

    return (
        <div>
            {(gameStatus!='intro') ? <Gameplay {...props} /> : null}
            {(gameStatus=='intro') ? <Intro isRulesHidden={isRulesHidden} onToggleRules={onToggleRules} onStartGame={onStartGame} /> : null}
        </div>
    )
}

export default App;
