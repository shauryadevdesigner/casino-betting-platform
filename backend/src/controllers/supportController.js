import { SupportChat } from "../models/SupportChat.js";
import { ChatMessage } from "../models/ChatMessage.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getOrCreateChat = asyncHandler(async (req, res) => {
  let chat = await SupportChat.findOne({ userId: req.user._id, status: "open" });
  if (!chat) {
    chat = await SupportChat.create({ userId: req.user._id });
  }

  const messages = await ChatMessage.find({ chatId: chat._id })
    .sort({ createdAt: 1 })
    .limit(100)
    .lean();

  res.json({ success: true, chat, messages });
});

export const rateChat = asyncHandler(async (req, res) => {
  const { rating } = req.body;
  await SupportChat.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { rating, status: "closed" },
  );
  res.json({ success: true });
});
