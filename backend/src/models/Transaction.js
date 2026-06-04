import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "deposit",
        "withdraw",
        "bet",
        "win",
        "daily_reward",
        "adjustment",
        "affiliate_payout",
        "mission_reward",
        "tournament_prize",
      ],
      required: true,
      index: true,
    },
    amount: { type: Number, required: true },
    balanceBefore: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    game: {
      type: String,
      enum: ["dice", "mines", "coinflip", null],
      default: null,
    },
    referenceId: { type: mongoose.Schema.Types.ObjectId, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

transactionSchema.index({ userId: 1, createdAt: -1 });

export const Transaction = mongoose.model("Transaction", transactionSchema);
