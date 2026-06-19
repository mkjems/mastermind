import React from 'react';

import {useGame} from '../GameContext';

// Placeholder for algorithm mode. The real setup / guessing / result screens
// arrive in P2.4–P2.7; for now this just confirms the mode is wired and offers
// a way back to the intro.
const AlgorithmGame = () => {
    const {gameStatus, onResetAll} = useGame();
    return (
        <div className="board">
            <h2>Play against the algorithm</h2>
            <p>Coming soon — current phase: <code>{gameStatus}</code>.</p>
            <button onClick={onResetAll}>Back</button>
        </div>
    );
};

export default AlgorithmGame;
