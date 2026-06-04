import mongoose from "mongoose";

const supportChatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["open", "waiting_human", "closed"],
      default: "open",
      index: true,
    },
    rating: { type: Number, min: 1, max: 5, default: null },
  },
  { timestamps: true },
);

export const SupportChat = mongoose.model("SupportChat", supportChatSchema);
