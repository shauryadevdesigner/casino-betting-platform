import { Tournament } from "../models/Tournament.js";
import { TournamentEntry } from "../models/TournamentEntry.js";
import { User } from "../models/User.js";
import { emitToUser } from "../services/socket.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../middleware/errorHandler.js";

export const getActiveTournament = asyncHandler(async (req, res) => {
  const now = new Date();
  let tournament = await Tournament.findOne({
    status: "active",
    startTime: { $lte: now },
    endTime: { $gte: now },
  }).lean();

  if (!tournament) {
    tournament = await Tournament.findOne({ status: "upcoming" })
      .sort({ startTime: 1 })
      .lean();
  }

  if (!tournament) {
    return res.json({ success: true, tournament: null, leaderboard: [] });
  }

  const entries = await TournamentEntry.find({ tournamentId: tournament._id })
    .populate("userId", "username displayName vipTier profilePictureUrl avatarUrl")
    .sort({ score: -1 })
    .limit(50)
    .lean();

  const myEntry = entries.find(
    (e) => e.userId?._id?.toString() === req.user?._id?.toString(),
  );

  res.json({
    success: true,
    tournament,
    leaderboard: entries.map((e, i) => ({
      rank: i + 1,
      score: e.score,
      user: e.userId,
      prize: e.prize,
    })),
    myRank: myEntry
      ? entries.findIndex((e) => e.userId._id.equals(req.user._id)) + 1
      : null,
  });
});

export const joinTournament = asyncHandler(async (req, res) => {
  const tournament = await Tournament.findById(req.params.id);
  if (!tournament || tournament.status !== "active") {
    throw new AppError("Tournament not active", 400);
  }

  const entry = await TournamentEntry.findOneAndUpdate(
    { tournamentId: tournament._id, userId: req.user._id },
    { $setOnInsert: { score: 0 } },
    { upsert: true, new: true },
  );

  res.json({ success: true, entry });
});
