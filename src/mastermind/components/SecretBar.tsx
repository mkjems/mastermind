import React from 'react';

import {useGame} from '../GameContext';
import Peg from './Peg';

// The secret the human set, shown openly in algorithm mode (it's their own code).
const SecretBar = () => {
    const {secretCode} = useGame();
    return (
        <div className="board">
            <p style={{textAlign: 'center', margin: '8px 0 0'}}>Your secret</p>
            <div className="board-row" style={{justifyContent: 'center'}}>
                {secretCode.map((color, index) => (
                    <Peg key={index} id={index} peg={color} />
                ))}
            </div>
        </div>
    );
};

export default SecretBar;
