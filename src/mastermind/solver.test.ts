import {describe, expect, it} from 'vitest';

import {allCodes, consistentCodes, nextGuess} from './solver';
import type {ScoredGuess} from './solver';
import {calculateFeedback, isSolved} from './reducers/row';
import {PEG_COLORS} from './script/constants';
import type {Color} from './types';

describe('allCodes', () => {
	const codes = allCodes();

	it('generates every 4-color permutation of the 8-color pool', () => {
		expect(codes).toHaveLength(8 * 7 * 6 * 5);
	});

	it('produces codes of four distinct colors from the pool', () => {
		codes.forEach((code) => {
			expect(code).toHaveLength(4);
			expect(new Set(code).size).toBe(4);
			expect(code.every((color) => PEG_COLORS.includes(color))).toBe(true);
		});
	});
});

describe('consistentCodes', () => {
	it('returns every code when nothing has been scored', () => {
		expect(consistentCodes([])).toHaveLength(8 * 7 * 6 * 5);
	});

	it('keeps only codes that reproduce the recorded feedback', () => {
		const secret: Color[] = ['yellow', 'green', 'blue', 'pink'];
		const guess: Color[] = ['yellow', 'blue', 'silver', 'white'];
		const history: ScoredGuess[] = [
			{guess, feedback: calculateFeedback(secret, guess)}
		];

		const survivors = consistentCodes(history);

		// The true secret always survives.
		expect(survivors).toContainEqual(secret);
		// Every survivor scores the same against the guess as the secret did.
		const target = calculateFeedback(secret, guess);
		survivors.forEach((candidate) => {
			expect(calculateFeedback(candidate, guess)).toEqual(target);
		});
		// It actually narrowed the field.
		expect(survivors.length).toBeLessThan(8 * 7 * 6 * 5);
	});

	it('returns nothing when the feedback is self-contradictory', () => {
		const code: Color[] = ['yellow', 'green', 'blue', 'pink'];
		const history: ScoredGuess[] = [
			// First score pins the secret to exactly `code`...
			{guess: code, feedback: ['red', 'red', 'red', 'red']},
			// ...then a second score that `code` could never have produced.
			{guess: ['silver', 'white', 'red', 'orange'], feedback: ['red', 'red', 'red', 'red']}
		];

		expect(consistentCodes(history)).toHaveLength(0);
		expect(nextGuess(history)).toBeUndefined();
	});
});

describe('nextGuess', () => {
	it('returns a valid opening code before anything is scored', () => {
		const guess = nextGuess([]);

		expect(guess).toBeDefined();
		expect(new Set(guess).size).toBe(4);
	});

	// Drive a full game: the computer guesses, we score honestly, repeat.
	const solveGuessCount = (secret: Color[]): number => {
		const history: ScoredGuess[] = [];
		for (let attempt = 0; attempt < 20; attempt++) {
			const guess = nextGuess(history);
			if (guess === undefined) {
				throw new Error('solver ran out of candidates');
			}
			const feedback = calculateFeedback(secret, guess);
			history.push({guess, feedback});
			if (isSolved(feedback)) {
				return history.length;
			}
		}
		throw new Error('solver did not converge');
	};

	it('solves a sample of secrets within the 10-row board limit', () => {
		const codes = allCodes();
		// Sample across the space to keep the test fast but representative.
		let worst = 0;
		for (let i = 0; i < codes.length; i += 17) {
			const guesses = solveGuessCount(codes[i]);
			worst = Math.max(worst, guesses);
		}
		expect(worst).toBeLessThanOrEqual(10);
	});
});
