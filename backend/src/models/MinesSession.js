import mongoose from "mongoose";

const minesSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    betAmount: { type: Number, required: true, min: 0 },
    mineCount: { type: Number, required: true, min: 1, max: 24 },
    gridSize: { type: Number, default: 25 },
    minePositions: { type: [Number], required: true, select: false },
    revealedTiles: { type: [Number], default: [] },
    multiplier: { type: Number, default: 1 },
    status: {
      type: String,
      enum: ["active", "lost", "cashed_out"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true },
);

minesSessionSchema.index({ userId: 1, status: 1 });

export const MinesSession = mongoose.model("MinesSession", minesSessionSchema);
