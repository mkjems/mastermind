import React from 'react';

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

const BoardRow = (props) => {
    const {isActiveRow, onPegClick, rowindex, gameStatus, showColorpicker, pegs, selectedPeg} = props;
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
                            gaveUp={gaveUp}
                            isSelected={isSelected}
                            key={index}
                            id={index}
                            peg={peg}
                            onPegClick={(isActiveRow && !gaveUp) ? onPegClick : () => {}}
                        />
                    );
                })}
                <Feedback {...props} />
            </div>
        </div>
        {isActiveRow && gameStatus === GAME_STATUS_GAVE_UP ? <Gaveup {...props} /> : null}
        {isActiveRow && showColorpicker ? <ColorPicker {...props} /> : null}
        {isActiveRow && gameStatus === GAME_STATUS_WON ? <Won {...props} /> : null}
        {isActiveRow && gameStatus === GAME_STATUS_LOST ? <Lost {...props} /> : null}
    </div>
    );
};

export default BoardRow;
