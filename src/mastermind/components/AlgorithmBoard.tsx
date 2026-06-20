import React from 'react';

import {useGame} from '../GameContext';
import Peg from './Peg';
import Feedback from './Feedback';
import FeedbackPicker from './FeedbackPicker';
import SecretBar from './SecretBar';
import type {Color} from '../types';

// Algorithm mode play: the human's secret on top, then the computer's guesses
// filling the board top-down. Past rows show the feedback already scored; the
// active row is scored with the picker below the board.
const AlgorithmBoard = () => {
    const {board, activeRow} = useGame();
    return (
        <div>
            <SecretBar />

            <p className="board" style={{textAlign: 'center'}}>
                Score each guess: red = right color &amp; place, white = right color only.
            </p>

            {board.slice(0, activeRow + 1).map((row, index) => {
                const isActive = index === activeRow;
                return (
                    <div className="board" key={index}>
                        <div
                            className="board-row"
                            style={{outline: isActive ? '2px solid #888' : undefined}}
                        >
                            {row.pegs.map((peg, pegIndex) => (
                                <Peg key={pegIndex} id={pegIndex} peg={peg} />
                            ))}
                            {isActive ? null : <Feedback feedbackPegs={row.feedback} />}
                        </div>
                    </div>
                );
            })}

            <FeedbackPicker key={activeRow} guess={board[activeRow].pegs as Color[]} />
        </div>
    );
};

export default AlgorithmBoard;
