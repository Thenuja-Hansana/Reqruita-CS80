const mongoose = require("mongoose");

const interviewerSessionFeedbackSchema = new mongoose.Schema(
  {
    meetingId: { type: String, default: "", trim: true },
    candidateId: { type: String, default: "", trim: true },
    status: {
      type: String,
      enum: ["positive", "neutral", "negative"],
      required: true,
    },
    feedback: { type: String, default: "", trim: true },
    source: { type: String, default: "desktop-app", trim: true },
    linkedSessionId: { type: String, default: "", trim: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model(
  "InterviewerSessionFeedback",
  interviewerSessionFeedbackSchema,
);
