import React from 'react';

import HiddenCode from './HiddenCode';
import BoardRow from './BoardRow';

const Gameplay = (props) => {
    const {board, activeRow, secretCode, isCodeHidden, onGiveUp, isRevealHidden} = props;
    return (
        <div>
            <HiddenCode {...props}/>
            {board.map((row, index) => {
                return (
                    <BoardRow
                        key={index}
                        rowindex={index}
                        pegs={row.pegs}
                        isActiveRow={activeRow === index}
                        feedbackPegs={row.feedback}
                        {...props}
                    />
                );
            })}
            <div className="board bottom-part" >
                {!isRevealHidden ? <button onClick={onGiveUp} >Give up</button> : null}
            </div>
        </div>
    );
};

export default Gameplay;
