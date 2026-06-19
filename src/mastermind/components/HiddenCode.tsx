import React from 'react';

import {useGame} from '../GameContext';
import Peg from './Peg';

const HiddenCode = () => {
	const {secretCode, isCodeHidden} = useGame();

	return (
        <div className="board board__secret">
        	<div className="cover">
	            <div className="hidden-row">
	            	{secretCode.map((peg, index) => {
	            		return <Peg key={index} id={index} peg={peg} />;
	            	})}
	            </div>
	            <div className={isCodeHidden ? 'cover-slider cover-slider_closed' : 'cover-slider'} ></div>
	        </div>
        </div>
	);
};

export default HiddenCode;
