import React from "react";

import type { FeedbackPeg } from "../types";
import SmallFeedbackPeg from "./SmallFeedbackPeg";

interface FeedbackPickerProps {
  onPlace: (peg: FeedbackPeg) => void;
  onFinalize: () => void;
  error: boolean;
}

// The scoring controls for the active computer guess: red (right colour & place),
// white (right colour only), and ✗ (no more pegs / done). The score the human is
// building shows live on the guess row itself; this is just the buttons + the
// "doesn't match" warning. State and validation live in the parent (AlgorithmGame).
const FeedbackPicker = ({
  onPlace,
  onFinalize,
  error,
}: FeedbackPickerProps) => {
  return (
    <div>
      <div className="picker-box">
        <button
          type="button"
          className="picker-color"
          aria-label="red"
          onClick={() => onPlace("red")}
        >
          <SmallFeedbackPeg type="red" />
        </button>
        <button
          type="button"
          className="picker-color"
          aria-label="white"
          onClick={() => onPlace("white")}
        >
          <SmallFeedbackPeg type="white" />
        </button>
        <button
          type="button"
          className="picker-color"
          aria-label="no more pegs"
          onClick={onFinalize}
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
