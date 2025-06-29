// controllers/chatController.js
const Chat = require("../models/Chat");
const User = require("../models/User");

const sendMessage = async (req, res) => {
  try {
    const { message, doctorId, patientId } = req.body;
    const sender = req.user._id;
    const senderRole = req.user.role;

    if (!message || !doctorId || !patientId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newMessage = new Chat({
      message,
      doctorId,
      patientId,
      sender,
      senderRole,
    });

    await newMessage.save();

    // Populate sender details before sending response
    const populatedMessage = await Chat.findById(newMessage._id)
      .populate("sender", "name")
      .lean();

    res.status(201).json({
      message: "Message sent successfully",
      data: populatedMessage,
    });
  } catch (error) {
    console.error("sendMessage error:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
};

const getMessages = async (req, res) => {
  try {
    const { doctorId, patientId } = req.params;

    if (!doctorId || !patientId) {
      return res.status(400).json({ error: "Missing doctorId or patientId" });
    }

    const messages = await Chat.find({
      doctorId,
      patientId,
    })
      .populate("sender", "name role")
      .sort({ createdAt: 1 });

    res.status(200).json({
      message: "Fetched messages successfully",
      data: messages,
    });
  } catch (error) {
    console.error("getMessages error:", error);
    res.status(500).json({ error: "Failed to get messages" });
  }
};

const createChat = async (req, res) => {
  res.status(501).json({ message: "createChat not implemented" });
};

const getChats = async (req, res) => {
  res.status(501).json({ message: "getChats not implemented" });
};

module.exports = { sendMessage, getMessages, createChat, getChats };
