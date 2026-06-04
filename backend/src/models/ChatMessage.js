import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SupportChat",
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    message: { type: String, required: true },
    isAi: { type: Boolean, default: false },
    isHuman: { type: Boolean, default: false },
  },
  { timestamps: true },
);

chatMessageSchema.index({ chatId: 1, createdAt: 1 });

export const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);
