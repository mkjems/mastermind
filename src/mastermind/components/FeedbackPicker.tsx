import React, { useState } from "react";

import { useGame } from "../GameContext";
import { calculateFeedback } from "../reducers/row";
import type { Color, FeedbackPeg } from "../types";
import SmallFeedbackPeg from "./SmallFeedbackPeg";
import SmallFeedbackHole from "./SmallFeedbackHole";

const FEEDBACK_LENGTH = 4;

const countOf = (pegs: FeedbackPeg[], peg: FeedbackPeg): number =>
  pegs.filter((value) => value === peg).length;

// P2.6: the human scores one feedback slot at a time (red / white / ✗). Red or
// white fills the active slot and advances; ✗ (or filling all four) finalizes,
// leaving the rest empty. The finalized score is validated against the secret the
// human set — a mismatch warns and clears so they can re-score, rather than
// feeding the solver a wrong number.
const FeedbackPicker = ({ guess }: { guess: Color[] }) => {
  const { secretCode, onSubmitFeedback } = useGame();
  const [entered, setEntered] = useState<FeedbackPeg[]>([]);
  const [error, setError] = useState(false);

  const finalize = (pegs: FeedbackPeg[]) => {
    const padded: FeedbackPeg[] = [
      ...pegs,
      ...Array<FeedbackPeg>(FEEDBACK_LENGTH - pegs.length).fill("none"),
    ];
    const truth = calculateFeedback(secretCode, guess);
    const matches =
      countOf(padded, "red") === countOf(truth, "red") &&
      countOf(padded, "white") === countOf(truth, "white");
    if (!matches) {
      setError(true);
      setEntered([]);
      return;
    }
    onSubmitFeedback(padded);
  };

  const place = (peg: FeedbackPeg) => {
    setError(false);
    const next = [...entered, peg];
    if (next.length === FEEDBACK_LENGTH) {
      finalize(next);
    } else {
      setEntered(next);
    }
  };

  return (
    <div className="feedback-picker">
      <div className="feedback">
        {Array.from({ length: FEEDBACK_LENGTH }, (_, index) => {
          const peg = entered[index];
          const isActive = index === entered.length;
          return (
            <div
              key={index}
              className="feedback-item"
              style={{ outline: isActive ? "2px solid #888" : undefined }}
            >
              {peg === "red" ? <SmallFeedbackPeg type="red" /> : null}
              {peg === "white" ? <SmallFeedbackPeg type="white" /> : null}
              {peg === undefined || peg === "none" ? (
                <SmallFeedbackHole />
              ) : null}
            </div>
          );
        })}
      </div>
      <div className="picker-box">
        <button
          type="button"
          className="picker-color"
          aria-label="red"
          onClick={() => place("red")}
        >
          <SmallFeedbackPeg type="red" />
        </button>
        <button
          type="button"
          className="picker-color"
          aria-label="white"
          onClick={() => place("white")}
        >
          <SmallFeedbackPeg type="white" />
        </button>
        <button
          type="button"
          className="picker-color"
          aria-label="no more pegs"
          onClick={() => finalize(entered)}
        >
          <span style={{ color: "#c00", fontSize: "1.8em", lineHeight: 1 }}>
            ✗
          </span>
        </button>
      </div>
      {error ? (
        <p>That doesn&apos;t match your secret — score it again.</p>
      ) : null}
    </div>
  );
};

export default FeedbackPicker;
