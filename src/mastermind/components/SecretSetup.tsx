import React, {useState} from 'react';

import {useGame} from '../GameContext';
import {PEG_COLORS, TOP_VIEW_COLORS} from '../script/constants';
import type {Color} from '../types';
import Peg from './Peg';
import PegIllu from './PegIllu';

const SECRET_LENGTH = 4;

// P2.4: the human sets the secret the computer will try to crack. Colors must be
// distinct (the game's codes never repeat a color), so already-picked colors are
// disabled in the palette.
const SecretSetup = () => {
    const {onConfirmSecret} = useGame();
    const [secret, setSecret] = useState<Color[]>([]);

    const addColor = (color: Color) => {
        if (secret.length >= SECRET_LENGTH || secret.includes(color)) {
            return;
        }
        setSecret([...secret, color]);
    };

    const isComplete = secret.length === SECRET_LENGTH;

    return (
        <div className="board">
            <h2>Set a secret code</h2>
            <p>Pick 4 different colors for the computer to crack.</p>

            <div className="board-row">
                {Array.from({length: SECRET_LENGTH}, (_, index) => (
                    <Peg key={index} id={index} peg={secret[index] ?? 'none'} />
                ))}
            </div>

            <div className="picker-box">
                {PEG_COLORS.map((color) => {
                    const used = secret.includes(color);
                    return (
                        <div
                            key={color}
                            className="picker-color"
                            style={{opacity: used ? 0.25 : 1, cursor: used ? 'default' : 'pointer'}}
                            onClick={() => addColor(color)}
                        >
                            <PegIllu colors={TOP_VIEW_COLORS[color]} />
                        </div>
                    );
                })}
            </div>

            <div className="board bottom-part">
                <button onClick={() => setSecret([])} disabled={secret.length === 0}>Clear</button>
                &nbsp;
                <button onClick={() => onConfirmSecret(secret)} disabled={!isComplete}>
                    Let the computer guess
                </button>
            </div>
        </div>
    );
};

export default SecretSetup;
