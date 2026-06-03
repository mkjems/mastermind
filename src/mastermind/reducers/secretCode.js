import {PEG_COLORS} from '../script/constants.js';
import {RANDOMIZE_SECRET_CODE, RESET_GAME} from '../gameActions.js';

const createSecretCode = () => {
	return ['', '', '', ''].reduce((acc) => {
		const randomValue = Math.floor(Math.random() * acc.pool.length);
		const newColor = acc.pool[randomValue];
		const newPool = acc.pool.filter((color) => {
			return color !== newColor;
		});

		return {
			pool: newPool,
			drawn: acc.drawn.concat(newColor)
		};
	}, {pool: [...PEG_COLORS], drawn: []}).drawn;
};

const secretCodeReducer = (state = createSecretCode(), action) => {
	switch (action.type) {
		case RESET_GAME:
			return createSecretCode();
		case RANDOMIZE_SECRET_CODE:
			return createSecretCode();
		default:
			return state;
	}
};

export default secretCodeReducer;
