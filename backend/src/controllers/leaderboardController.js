import { supabase } from "../lib/supabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../middleware/errorHandler.js";

const SORT_MAP = {
  balance: "balance",
  biggestWin: "stats->biggestWin",
  gamesPlayed: "stats->gamesPlayed",
  wagered: "stats->totalWagered",
};

export const getLeaderboard = asyncHandler(async (req, res) => {
  const sort = req.query.sort || "balance";
  const limit = Math.min(Number(req.query.limit) || 20, 50);

  if (!SORT_MAP[sort]) {
    throw new AppError("Invalid sort. Use balance, biggestWin, wagered, or gamesPlayed", 400);
  }

  // Query profiles joining wallets
  let query = supabase
    .from("profiles")
    .select("id, username, display_name, stats, vip_tier, avatar_url, profile_picture_url, wallets!inner(balance)")
    .eq("is_active", true);

  if (sort === "balance") {
    query = query.order("balance", { foreignTable: "wallets", ascending: false });
  } else {
    query = query.order(SORT_MAP[sort], { ascending: false });
  }

  const { data: users, error } = await query.limit(limit);

  if (error || !users) throw new AppError("Failed to fetch leaderboard", 500);

  res.json({
    success: true,
    sort,
    leaderboard: users.map((u, i) => {
      const balance = Number(u.wallets?.balance ?? 1000);
      const biggestWin = Number(u.stats?.biggestWin ?? 0);
      const gamesPlayed = Number(u.stats?.gamesPlayed ?? 0);
      const totalWagered = Number(u.stats?.totalWagered ?? 0);

      let value = balance;
      if (sort === "biggestWin") value = biggestWin;
      else if (sort === "wagered") value = totalWagered;
      else if (sort === "gamesPlayed") value = gamesPlayed;

      return {
        rank: i + 1,
        username: u.username,
        displayName: u.display_name || u.username,
        balance,
        biggestWin,
        gamesPlayed,
        avatarUrl: u.avatar_url || u.profile_picture_url,
        vipTier: u.vip_tier,
        value,
      };
    }),
  });
});
