const express = require("express");

const sessionFeedbackController = require("../controllers/sessionFeedbackController");

const router = express.Router();

router.post("/", sessionFeedbackController.submitInterviewerFeedback);

module.exports = router;
