import React from 'react';

import {useGame} from '../GameContext';
import HiddenCode from './HiddenCode';
import BoardRow from './BoardRow';

const Gameplay = () => {
    const {board, activeRow, canGiveUp, onGiveUp} = useGame();
    return (
        <div>
            <HiddenCode />
            {board.map((row, index) => {
                return (
                    <BoardRow
                        key={index}
                        pegs={row.pegs}
                        feedbackPegs={row.feedback}
                        isActiveRow={activeRow === index}
                    />
                );
            })}
            <div className="board bottom-part" >
                {canGiveUp ? <button onClick={onGiveUp} >Give up</button> : null}
            </div>
        </div>
    );
};

export default Gameplay;
