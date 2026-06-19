import React from 'react';

import {useGame} from '../GameContext.js';
import Peg from './Peg';
import Feedback from './Feedback';
import Gaveup from './Gaveup';
import Won from './Won';
import Lost from './Lost';
import ColorPicker from './ColorPicker';
import {
    GAME_STATUS_GAVE_UP,
    GAME_STATUS_LOST,
    GAME_STATUS_WON
} from '../gameStatus.js';

const BoardRow = ({pegs, feedbackPegs, isActiveRow}) => {
    const {onPegClick, gameStatus, showColorPicker, selectedPeg} = useGame();
    const gaveUp = gameStatus === GAME_STATUS_GAVE_UP;

    return (
    <div>
        <div className="board">
            <div className="board-row">
                {pegs.map((peg, index) => {
                    const isSelected = isActiveRow && selectedPeg === index;
                    return (
                        <Peg
                            isActiveRow={isActiveRow}
                            isSelected={isSelected}
                            key={index}
                            id={index}
                            peg={peg}
                            onPegClick={(isActiveRow && !gaveUp) ? onPegClick : () => {}}
                        />
                    );
                })}
                <Feedback feedbackPegs={feedbackPegs} />
            </div>
        </div>
        {isActiveRow && gameStatus === GAME_STATUS_GAVE_UP ? <Gaveup /> : null}
        {isActiveRow && showColorPicker ? <ColorPicker /> : null}
        {isActiveRow && gameStatus === GAME_STATUS_WON ? <Won /> : null}
        {isActiveRow && gameStatus === GAME_STATUS_LOST ? <Lost /> : null}
    </div>
    );
};

export default BoardRow;
