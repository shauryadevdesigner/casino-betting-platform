import mongoose from "mongoose";

const vipTierSchema = new mongoose.Schema(
  {
    tierKey: {
      type: String,
      enum: ["bronze", "silver", "gold", "platinum"],
      required: true,
      unique: true,
    },
    name: { type: String, required: true },
    minWagered: { type: Number, required: true, min: 0 },
    dailyRewardBonusPct: { type: Number, default: 0 },
    affiliateCommissionRate: { type: Number, default: 0.05 },
    benefits: { type: [String], default: [] },
    badgeIcon: { type: String, default: "" },
  },
  { timestamps: true },
);

export const VipTier = mongoose.model("VipTier", vipTierSchema);
