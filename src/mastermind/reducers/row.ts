import type { Color, FeedbackPeg, PegValue } from "../types";

export const isSolved = (feedback: FeedbackPeg[]): boolean =>
  feedback.every((peg) => peg === "red");

export function calculateFeedback(
  secret: Color[],
  answer: PegValue[],
): FeedbackPeg[] {
  // Two-pass count so it stays correct when colors repeat: first the exact
  // position matches (reds), then color-only matches among what's left (whites),
  // pairing each leftover color at most min(secretCount, answerCount) times.
  const numReds = secret.filter(
    (color, index) => color === answer[index],
  ).length;

  const secretRemaining: Record<string, number> = {};
  const answerRemaining: Record<string, number> = {};
  secret.forEach((color, index) => {
    if (color === answer[index]) {
      return;
    }
    secretRemaining[color] = (secretRemaining[color] ?? 0) + 1;
    answerRemaining[answer[index]] = (answerRemaining[answer[index]] ?? 0) + 1;
  });

  const numWhites = Object.keys(answerRemaining).reduce((total, color) => {
    return (
      total + Math.min(answerRemaining[color], secretRemaining[color] ?? 0)
    );
  }, 0);

  const reds: FeedbackPeg[] = Array(numReds).fill("red");
  const whites: FeedbackPeg[] = Array(numWhites).fill("white");
  const empty: FeedbackPeg[] = Array(
    secret.length - (numReds + numWhites),
  ).fill("none");

  return [...reds, ...whites, ...empty];
}
