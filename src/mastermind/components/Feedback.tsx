import React from "react";

import type { FeedbackPeg as FeedbackValue } from "../types";
import SmallFeedbackPeg from "./SmallFeedbackPeg";
import SmallFeedbackHole from "./SmallFeedbackHole";

interface FeedbackPegProps {
  pegType?: FeedbackValue;
}

const FeedbackPeg = ({ pegType = "none" }: FeedbackPegProps) => {
  return (
    <div className="feedback-item">
      {pegType === "red" ? <SmallFeedbackPeg type="red" /> : null}
      {pegType === "white" ? <SmallFeedbackPeg type="white" /> : null}
      {pegType === "none" ? <SmallFeedbackHole /> : null}
    </div>
  );
};

interface FeedbackProps {
  feedbackPegs: FeedbackValue[];
}

const Feedback = ({ feedbackPegs }: FeedbackProps) => {
  return (
    <div className="feedback">
      {feedbackPegs.map((type, index) => {
        return <FeedbackPeg key={index} pegType={type} />;
      })}
    </div>
  );
};

export default Feedback;
