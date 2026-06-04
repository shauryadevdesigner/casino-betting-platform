import mongoose from "mongoose";

const missionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    missionType: {
      type: String,
      enum: ["daily", "weekly", "special", "vip"],
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    progress: { type: Number, default: 0, min: 0 },
    target: { type: Number, required: true, min: 1 },
    reward: { type: Number, required: true, min: 0 },
    completed: { type: Boolean, default: false, index: true },
    claimed: { type: Boolean, default: false },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true },
);

missionSchema.index({ userId: 1, missionType: 1, completed: 1 });

export const Mission = mongoose.model("Mission", missionSchema);
