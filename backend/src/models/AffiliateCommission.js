import mongoose from "mongoose";

const affiliateCommissionSchema = new mongoose.Schema(
  {
    referrerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    referredId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    gameHistoryId: { type: mongoose.Schema.Types.ObjectId, ref: "GameHistory" },
    lossAmount: { type: Number, required: true, min: 0 },
    commissionRate: { type: Number, required: true },
    commissionAmount: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);

affiliateCommissionSchema.index({ referrerId: 1, createdAt: -1 });

export const AffiliateCommission = mongoose.model(
  "AffiliateCommission",
  affiliateCommissionSchema,
);
