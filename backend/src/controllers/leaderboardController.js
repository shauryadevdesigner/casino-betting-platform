import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../middleware/errorHandler.js";

const SORT_MAP = {
  balance: { balance: -1 },
  biggestWin: { "stats.biggestWin": -1 },
  gamesPlayed: { "stats.gamesPlayed": -1 },
  wagered: { "stats.totalWagered": -1 },
};

export const getLeaderboard = asyncHandler(async (req, res) => {
  const sort = req.query.sort || "balance";
  const limit = Math.min(Number(req.query.limit) || 20, 50);

  const sortKey = SORT_MAP[sort];
  if (!sortKey) throw new AppError("Invalid sort. Use balance, biggestWin, or gamesPlayed");

  const users = await User.find({ isActive: true })
    .sort(sortKey)
    .limit(limit)
    .select("username displayName balance stats.biggestWin stats.gamesPlayed stats.totalWagered avatarUrl profilePictureUrl vipTier")
    .lean();

  res.json({
    success: true,
    sort,
    leaderboard: users.map((u, i) => ({
      rank: i + 1,
      username: u.username,
      displayName: u.displayName || u.username,
      balance: u.balance,
      biggestWin: u.stats?.biggestWin ?? 0,
      gamesPlayed: u.stats?.gamesPlayed ?? 0,
      avatarUrl: u.avatarUrl || u.profilePictureUrl,
      vipTier: u.vipTier,
      value:
        sort === "balance"
          ? u.balance
          : sort === "biggestWin"
            ? u.stats?.biggestWin ?? 0
            : sort === "wagered"
              ? u.stats?.totalWagered ?? 0
              : u.stats?.gamesPlayed ?? 0,
    })),
  });
});
