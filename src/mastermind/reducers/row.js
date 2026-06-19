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
