import mongoose from "mongoose";

const dailyRewardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: { type: Number, required: true, min: 0 },
    claimedAt: { type: Date, required: true, default: Date.now, index: true },
    streakDay: { type: Number, default: 1, min: 1 },
  },
  { timestamps: true },
);

dailyRewardSchema.index({ userId: 1, claimedAt: -1 });

export const DailyReward = mongoose.model("DailyReward", dailyRewardSchema);
