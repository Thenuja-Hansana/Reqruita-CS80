const mongoose = require("mongoose");

// dummy DB connection
mongoose.connect("mongodb://127.0.0.1:27017/reqruita_dummy_chat", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.once("open", () => {
  console.log("✅ Dummy Chat DB Connected");
});

// schema + model in SAME FILE
const chatSchema = new mongoose.Schema(
  {
    interviewId: String,
    sender: String, // interviewer | interviewee
    message: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatMessage", chatSchema);
