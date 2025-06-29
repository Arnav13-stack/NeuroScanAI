// routes/chatRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  sendMessage,
  getMessages,
  createChat,
  getChats,
} = require("../controllers/chatController");

router.post("/send", protect, sendMessage);
router.get("/:doctorId/:patientId", protect, getMessages);
router.post("/", protect, createChat);
router.get("/", protect, getChats);

module.exports = router;
