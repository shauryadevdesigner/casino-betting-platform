import mongoose from "mongoose";

const gameHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    game: {
      type: String,
      enum: ["dice", "mines", "coinflip"],
      required: true,
      index: true,
    },
    betAmount: { type: Number, required: true, min: 0 },
    payout: { type: Number, required: true, min: 0 },
    profit: { type: Number, required: true },
    won: { type: Boolean, required: true, index: true },
    multiplier: { type: Number, default: 0 },
    result: { type: mongoose.Schema.Types.Mixed, required: true },
    serverSeed: { type: String, default: null },
    clientSeed: { type: String, default: null },
    combinedHash: { type: String, default: null, index: true },
    status: {
      type: String,
      enum: ["completed", "lost", "cashed_out"],
      default: "completed",
    },
  },
  { timestamps: true },
);

gameHistorySchema.index({ userId: 1, createdAt: -1 });
gameHistorySchema.index({ game: 1, createdAt: -1 });

export const GameHistory = mongoose.model("GameHistory", gameHistorySchema);
