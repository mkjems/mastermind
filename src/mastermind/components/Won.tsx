import React from 'react';

import {useGame} from '../GameContext';

const Won = () => {
	const {onResetAll, activeRow} = useGame();
	return (
		<div className="board statusMessages">
			<p>
				You solved the secret code in {(activeRow+1)} attempts!
			</p>
			<button onClick={onResetAll}>Ok</button>
		</div>
	)
}

export default Won
