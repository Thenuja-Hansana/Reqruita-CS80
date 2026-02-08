const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

console.log("CHAT BACKEND (HYBRID MODE) RUNNING");

const app = express();
const PORT = 3002;

app.use(cors());
app.use(bodyParser.json());

// MongoDB setup (optional)

let mongoAvailable = false;
let ChatModel = null;

// in-memory fallback
let memoryChats = [];

(async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/reqruita_chat_dummy");
    mongoAvailable = true;
    console.log("✅ MongoDB connected (persistent mode)");

    const chatSchema = new mongoose.Schema(
      {
        interviewId: String,
        sender: String,
        message: String,
      },
      { timestamps: true }
    );

    ChatModel = mongoose.model("Chat", chatSchema);
  } catch (err) {
    console.log("⚠ MongoDB not running → using in-memory storage");
  }
})();

// APIs


// SAVE chat
app.post("/api/chat/save", async (req, res) => {
  const { interviewId, sender, message } = req.body;

  if (!interviewId || !sender || !message) {
    return res.status(400).json({ error: "Missing fields" });
  }

  if (mongoAvailable && ChatModel) {
    // save to MongoDB
    const chat = await ChatModel.create({ interviewId, sender, message });
    return res.json({ mode: "mongo", chat });
  } else {
    // save to memory
    const chat = {
      interviewId,
      sender,
      message,
      createdAt: new Date(),
    };
    memoryChats.push(chat);
    return res.json({ mode: "memory", chat });
  }
});

// GET chat
app.get("/api/chat/:interviewId", async (req, res) => {
  const { interviewId } = req.params;

  if (mongoAvailable && ChatModel) {
    const chats = await ChatModel.find({ interviewId }).sort({ createdAt: 1 });
    return res.json({ mode: "mongo", chats });
  } else {
    const chats = memoryChats.filter(
      c => c.interviewId === interviewId
    );
    return res.json({ mode: "memory", chats });
  }
});


// Start server

app.listen(PORT, () => {
  console.log(`🚀 Chat backend running on http://localhost:${PORT}`);
});

