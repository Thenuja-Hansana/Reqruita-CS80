const InterviewSession = require("../../../dashboard/src/models/InterviewSession");
const InterviewerSessionFeedback = require("../models/InterviewerSessionFeedback");

const STATUS_TO_RESULT = {
  positive: "Passed",
  neutral: "On Hold",
  negative: "Failed",
};

exports.submitInterviewerFeedback = async (req, res) => {
  try {
    const { meetingId, candidateId, status, feedback } = req.body || {};

    if (!status || feedback === undefined) {
      return res.status(400).json({
        error: "status and feedback are required",
      });
    }

    const normalizedStatus = String(status).trim().toLowerCase();
    const mappedResult = STATUS_TO_RESULT[normalizedStatus];

    if (!mappedResult) {
      return res.status(400).json({
        error: "status must be one of: positive, neutral, negative",
      });
    }

    const normalizedMeetingId = String(meetingId || "").trim();
    const normalizedCandidateId = String(candidateId || "").trim();
    const normalizedFeedback = String(feedback || "").trim();

    let linkedSessionId = "";
    let sessionUpdated = false;

    if (normalizedMeetingId && normalizedCandidateId) {
      const session = await InterviewSession.findOne({
        meetingId: normalizedMeetingId,
        "candidates.candidateId": normalizedCandidateId,
      });

      if (session) {
        const slotIndex = session.candidates.findIndex(
          (candidate) => String(candidate.candidateId) === normalizedCandidateId,
        );

        if (slotIndex >= 0) {
          session.candidates[slotIndex].result = mappedResult;
          session.candidates[slotIndex].notes = normalizedFeedback;
          session.markModified("candidates");
          await session.save();
          linkedSessionId = String(session.sessionId || "");
          sessionUpdated = true;
        }
      }
    }

    const savedFeedback = await InterviewerSessionFeedback.create({
      meetingId: normalizedMeetingId,
      candidateId: normalizedCandidateId,
      status: normalizedStatus,
      feedback: normalizedFeedback,
      source: "desktop-app",
      linkedSessionId,
    });

    return res.json({
      message: "Interviewer session feedback saved",
      data: {
        feedbackId: savedFeedback._id,
        meetingId: savedFeedback.meetingId,
        candidateId: savedFeedback.candidateId,
        status: savedFeedback.status,
        feedback: savedFeedback.feedback,
        linkedSessionId: savedFeedback.linkedSessionId,
        sessionUpdated,
      },
    });
  } catch (err) {
    console.error("Failed to save interviewer feedback:", err);
    return res.status(500).json({ error: "Failed to save interviewer feedback" });
  }
};
