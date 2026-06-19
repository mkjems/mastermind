import React from 'react';

import {useGame} from '../GameContext';
import Peg from './Peg';
import Feedback from './Feedback';

// P2.5: read-only view of the computer's guesses and the feedback scored so far.
// The interactive scoring UI for the active row is added in P2.6.
const AlgorithmBoard = () => {
    const {board, activeRow} = useGame();
    return (
        <div>
            {board.map((row, index) => (
                <div className="board" key={index}>
                    <div
                        className="board-row"
                        style={{outline: index === activeRow ? '2px solid #888' : undefined}}
                    >
                        {row.pegs.map((peg, pegIndex) => (
                            <Peg key={pegIndex} id={pegIndex} peg={peg} />
                        ))}
                        <Feedback feedbackPegs={row.feedback} />
                    </div>
                </div>
            ))}
            <p><em>Feedback scoring UI arrives in P2.6.</em></p>
        </div>
    );
};

export default AlgorithmBoard;
