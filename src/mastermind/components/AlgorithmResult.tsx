import React from 'react';

import {useGame} from '../GameContext';
import {GAME_STATUS_ALGO_SOLVED} from '../gameStatus';

const AlgorithmResult = () => {
    const {gameStatus, activeRow, onResetAll} = useGame();
    const solved = gameStatus === GAME_STATUS_ALGO_SOLVED;
    return (
        <div className="board statusMessages">
            {solved ? (
                <p>The computer cracked your code in {activeRow + 1} guesses!</p>
            ) : (
                <p>The computer couldn&apos;t crack it — the feedback was inconsistent.</p>
            )}
            <button onClick={onResetAll}>Ok</button>
        </div>
    );
};

export default AlgorithmResult;
