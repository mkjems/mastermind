import React from 'react';

import Feedback from './Feedback';
import Peg from './Peg';
import type {Color, FeedbackPeg} from '../types';

const RULES_CODE: Color[] = ['yellow', 'green', 'blue', 'pink'];
const WHITE_EXAMPLE: FeedbackPeg[] = ['white', 'none', 'none', 'none'];
const RED_EXAMPLE: FeedbackPeg[] = ['red', 'none', 'none', 'none'];

const Rules = () => {
    return (
        <div>
            <p>The aim of the game is to guess a secret code of 4 colors.</p>
            <div className="intro-explain">
                {RULES_CODE.map((val, index)=>{
                    return <Peg key={index} id={index} peg={val} />
                })}
            </div>
            <p>The colors are drawn from a pool of 8 colors, each color can only appear once in the code.</p>
            <p>After each guess, you will be given feedback in the form of some red and white dots.</p>
            <div className="intro-explain">
                <Feedback feedbackPegs={WHITE_EXAMPLE} />
            </div>
            <p>A white dot means one of the colors  has the right color but not the right position.</p>
            <div className="intro-explain">
                <Feedback feedbackPegs={RED_EXAMPLE} />
            </div>
            <p>A red dot means one of the colors has the right color and the right position.</p>
            <p>You have 10 attempts to solve the code.</p>
            <p>When you guess, you can use the same color multiple times.</p>
        </div>
    );
};

interface IntroProps {
    onStartGame: () => void;
    onStartAlgorithm: () => void;
    onToggleRules: () => void;
    isRulesHidden: boolean;
}

const Intro = ({onStartGame, onStartAlgorithm, onToggleRules, isRulesHidden}: IntroProps)=> {
    return (
        <div className="board" >
            <h1>Mastermind</h1>
            <button onClick={onStartGame}>Start game</button>&nbsp;
            <button onClick={onStartAlgorithm}>Play against algorithm</button>&nbsp;
            <button onClick={onToggleRules}>
                {isRulesHidden ? 'Show' : 'Hide'} Rules
            </button>
            {isRulesHidden ? null : <Rules />}
        </div>
    );
};

export default Intro;
