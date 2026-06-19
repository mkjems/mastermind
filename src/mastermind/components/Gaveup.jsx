import React from 'react';

import {useGame} from '../GameContext.js';

const Gaveup = () => {
	const {onResetAll, activeRow} = useGame();
	return (
		<div className="board statusMessages">
			<p>You gave up after {activeRow} attempts.</p>
			<button onClick={onResetAll}>Ok</button>
		</div>
	);
};

export default Gaveup;
