import React from "react";

import type { FeedbackPeg } from "../types";
import SmallFeedbackPeg from "./SmallFeedbackPeg";

interface FeedbackPickerProps {
  onPlace: (peg: FeedbackPeg) => void;
  onFinalize: () => void;
  onUndo: () => void;
  canPlace: boolean;
  canUndo: boolean;
  error: boolean;
}

// The scoring controls for the active computer guess. Red/white add score pegs,
// the green check submits, and undo removes the latest score peg. The score the
// human is building shows live on the guess row itself; this component is just
// the physical-looking controls plus the validation message.
const FeedbackPicker = ({
  onPlace,
  onFinalize,
  onUndo,
  canPlace,
  canUndo,
  error,
}: FeedbackPickerProps) => {
  return (
    <div className="feedback-picker">
      <div className="feedback-picker-controls">
        <button
          type="button"
          className="feedback-button feedback-button-peg feedback-button-red"
          aria-label="red feedback peg"
          disabled={!canPlace}
          onClick={() => onPlace("red")}
        >
          <SmallFeedbackPeg type="red" />
        </button>
        <button
          type="button"
          className="feedback-button feedback-button-peg feedback-button-white"
          aria-label="white feedback peg"
          disabled={!canPlace}
          onClick={() => onPlace("white")}
        >
          <SmallFeedbackPeg type="white" />
        </button>
        <button
          type="button"
          className="feedback-button feedback-button-submit"
          aria-label="submit feedback"
          onClick={onFinalize}
        >
          <span aria-hidden="true">✔︎</span>
        </button>
        <button
          type="button"
          className="feedback-button feedback-button-undo"
          aria-label="undo feedback peg"
          disabled={!canUndo}
          onClick={onUndo}
        >
          <span aria-hidden="true">&lt;</span>
        </button>
      </div>
      <p className="feedback-picker-error" role={error ? "alert" : undefined}>
        {error ? "That doesn't match your secret — score it again." : ""}
      </p>
    </div>
  );
};

export default FeedbackPicker;
