import {describe, expect, it} from 'vitest';

import {calculateFeedback, isSolved} from './row';

describe('calculateFeedback', () => {
	it('gives a red for each color in the right position', () => {
		const feedback = calculateFeedback(
			['yellow', 'green', 'blue', 'pink'],
			['yellow', 'green', 'blue', 'pink']
		);

		expect(feedback).toEqual(['red', 'red', 'red', 'red']);
	});

	it('gives a white for a right color in the wrong position', () => {
		const feedback = calculateFeedback(
			['yellow', 'green', 'blue', 'pink'],
			['green', 'yellow', 'silver', 'white']
		);

		expect(feedback).toEqual(['white', 'white', 'none', 'none']);
	});

	it('mixes reds, whites, and blanks', () => {
		const feedback = calculateFeedback(
			['yellow', 'green', 'blue', 'pink'],
			['yellow', 'blue', 'silver', 'pink']
		);

		expect(feedback).toEqual(['red', 'red', 'white', 'none']);
	});

	it('gives all blanks when nothing matches', () => {
		const feedback = calculateFeedback(
			['yellow', 'green', 'blue', 'pink'],
			['silver', 'white', 'red', 'orange']
		);

		expect(feedback).toEqual(['none', 'none', 'none', 'none']);
	});

	describe('with duplicate colors in the guess', () => {
		// The secret always has unique colors (see secretCode.ts), but the rules
		// allow repeating a color in a guess, so feedback must handle that.
		it('does not award more whites than the secret contains of a color', () => {
			// One red in position; the surplus guessed reds earn nothing extra.
			const feedback = calculateFeedback(
				['red', 'green', 'blue', 'pink'],
				['red', 'red', 'red', 'red']
			);

			expect(feedback).toEqual(['red', 'none', 'none', 'none']);
		});

		it('credits a repeated color as white only once', () => {
			// The secret has a single green (out of position in the guess); only one
			// of the two guessed greens can match it.
			const feedback = calculateFeedback(
				['yellow', 'green', 'blue', 'pink'],
				['green', 'orange', 'green', 'silver']
			);

			expect(feedback).toEqual(['white', 'none', 'none', 'none']);
		});

		it('counts an exact match before crediting a repeat as white', () => {
			// Green is matched exactly; the other guessed green has nothing left to pair.
			const feedback = calculateFeedback(
				['yellow', 'green', 'blue', 'pink'],
				['green', 'green', 'orange', 'silver']
			);

			expect(feedback).toEqual(['red', 'none', 'none', 'none']);
		});
	});
});

describe('isSolved', () => {
	it('is true only when every feedback peg is red', () => {
		expect(isSolved(['red', 'red', 'red', 'red'])).toBe(true);
	});

	it('is false when any peg is not red', () => {
		expect(isSolved(['red', 'red', 'white', 'none'])).toBe(false);
		expect(isSolved(['none', 'none', 'none', 'none'])).toBe(false);
	});
});
