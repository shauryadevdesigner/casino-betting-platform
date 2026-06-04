import mongoose from "mongoose";

const tournamentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date, required: true, index: true },
    prizePool: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["upcoming", "active", "ended"],
      default: "upcoming",
      index: true,
    },
    prizeDistribution: {
      type: [{ rank: Number, percent: Number }],
      default: [
        { rank: 1, percent: 50 },
        { rank: 2, percent: 30 },
        { rank: 3, percent: 20 },
      ],
    },
  },
  { timestamps: true },
);

export const Tournament = mongoose.model("Tournament", tournamentSchema);
