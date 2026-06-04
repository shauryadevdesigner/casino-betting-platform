import mongoose from "mongoose";

const tournamentEntrySchema = new mongoose.Schema(
  {
    tournamentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    score: { type: Number, default: 0, index: true },
    position: { type: Number, default: null },
    prize: { type: Number, default: 0 },
  },
  { timestamps: true },
);

tournamentEntrySchema.index({ tournamentId: 1, userId: 1 }, { unique: true });
tournamentEntrySchema.index({ tournamentId: 1, score: -1 });

export const TournamentEntry = mongoose.model("TournamentEntry", tournamentEntrySchema);
