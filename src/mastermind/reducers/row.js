import {ROW_START} from '../script/constants.js';
import {
	BEGIN_NEW_ROW,
	CHOSE_THIS_COLOR,
	GAME_GIVE_UP,
	GIVE_FEEDBACK
} from '../gameActions.js';

export const isSolved = (feedback) => feedback.every((peg) => peg === 'red');

export function calculateFeedback(secret, answer) {
	// Two-pass count so it stays correct when colors repeat: first the exact
	// position matches (reds), then color-only matches among what's left (whites),
	// pairing each leftover color at most min(secretCount, answerCount) times.
	const numReds = secret.filter((color, index) => color === answer[index]).length;

	const secretRemaining = {};
	const answerRemaining = {};
	secret.forEach((color, index) => {
		if (color === answer[index]) {
			return;
		}
		secretRemaining[color] = (secretRemaining[color] ?? 0) + 1;
		answerRemaining[answer[index]] = (answerRemaining[answer[index]] ?? 0) + 1;
	});

	const numWhites = Object.keys(answerRemaining).reduce((total, color) => {
		return total + Math.min(answerRemaining[color], secretRemaining[color] ?? 0);
	}, 0);

	const reds = Array(numReds).fill('red');
	const whites = Array(numWhites).fill('white');
	const empty = Array(secret.length - (numReds + numWhites)).fill('none');

	return [...reds, ...whites, ...empty];
}

const PEGS_START = ['none', 'none', 'none', 'none'];
const FEEDBACK_START = ['none', 'none', 'none', 'none'];

const pegsReducer = (state = PEGS_START, action) => {
	switch (action.type) {
		case GAME_GIVE_UP:
			return state.map((peg) => {
				if (peg !== 'select' && peg !== 'none') {
					return peg;
				}
				return 'none';
			});
		case BEGIN_NEW_ROW:
			if (action.makeSelectable) {
				return ['select', 'select', 'select', 'select'];
			}
			return state;
		case CHOSE_THIS_COLOR:
			if (action.isActiveRow) {
				return [
					...state.slice(0, action.selectedPeg),
					action.name,
					...state.slice(action.selectedPeg + 1)
				];
			}
			return state;
		default:
			return state;
	}
};

const feedbackReducer = (state = FEEDBACK_START, action, pegs) => {
	switch (action.type) {
		case GIVE_FEEDBACK:
			if (action.isActiveRow) {
				return calculateFeedback(action.secretCode, pegs);
			}
			return state;
		default:
			return state;
	}
};

const rowReducer = (state = ROW_START, action) => {
	switch (action.type) {
		case GAME_GIVE_UP:
			if (action.isActiveRow) {
				return {
					pegs: pegsReducer(state.pegs, action),
					feedback: state.feedback
				};
			}
			return state;
		case BEGIN_NEW_ROW:
			const rowAction = action.isActiveRow && state.pegs.every((peg) => peg === 'none')
				? {...action, makeSelectable: true}
				: action;

			return {
				pegs: pegsReducer(state.pegs, rowAction),
				feedback: feedbackReducer(state.feedback, rowAction, state.pegs)
			};
		case CHOSE_THIS_COLOR:
			return {
				pegs: pegsReducer(state.pegs, action),
				feedback: feedbackReducer(state.feedback, action)
			};
		case GIVE_FEEDBACK:
			return {
				pegs: state.pegs,
				feedback: feedbackReducer(state.feedback, action, state.pegs)
			};
		default:
			return state;
	}
};

export default rowReducer;
