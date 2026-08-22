import { PEG_COLORS } from "./script/constants";
import { calculateFeedback } from "./reducers/row";
import type { Color, FeedbackPeg } from "./types";

const CODE_LENGTH = 4;

// One past guess the computer made and the feedback the human gave for it.
export interface ScoredGuess {
  guess: Color[];
  feedback: FeedbackPeg[];
}

// Every secret the game could have: 4 distinct colors drawn from the 8-color
// pool (8·7·6·5 = 1680 codes).
export const allCodes = (): Color[][] => {
  const result: Color[][] = [];
  const build = (prefix: Color[], remaining: Color[]): void => {
    if (prefix.length === CODE_LENGTH) {
      result.push(prefix);
      return;
    }
    remaining.forEach((color, index) => {
      build(
        [...prefix, color],
        remaining.filter((_, i) => i !== index),
      );
    });
  };
  build([], PEG_COLORS);
  return result;
};

const ALL_CODES = allCodes();

// Feedback is just a count of reds and whites; position/order doesn't matter.
const sameScore = (a: FeedbackPeg[], b: FeedbackPeg[]): boolean => {
  const count = (feedback: FeedbackPeg[], peg: FeedbackPeg): number =>
    feedback.filter((value) => value === peg).length;
  return (
    count(a, "red") === count(b, "red") &&
    count(a, "white") === count(b, "white")
  );
};

// The codes still possible given everything scored so far: a candidate survives
// only if, treated as the secret, it would have produced the recorded feedback
// for every past guess.
export const consistentCodes = (history: ScoredGuess[]): Color[][] =>
  ALL_CODES.filter((candidate) =>
    history.every(({ guess, feedback }) =>
      sameScore(calculateFeedback(candidate, guess), feedback),
    ),
  );

// The computer's next guess: the first still-consistent code (a fixed opener
// when nothing has been scored yet). undefined means the human's feedback is
// self-contradictory — no code can satisfy it.
export const nextGuess = (history: ScoredGuess[]): Color[] | undefined =>
  consistentCodes(history)[0];
