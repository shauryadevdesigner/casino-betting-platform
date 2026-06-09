import { supabase } from "../lib/supabase.js";
import { AppError } from "../middleware/errorHandler.js";
import { checkAndUpgradeVip } from "./vip.service.js";
import { recordLossCommission } from "./affiliate.service.js";
import { emitToUser } from "./socket.service.js";

async function progressMissions(userId, { betAmount, won }) {
  try {
    const now = new Date().toISOString();
    // Query active and uncompleted missions
    const { data: missions, error } = await supabase
      .from("missions")
      .select("*")
      .eq("user_id", userId)
      .eq("completed", false)
      .or(`expires_at.is.null,expires_at.gt.${now}`);

    if (error || !missions) return;

    for (const m of missions) {
      let increment = 0;
      const titleLower = m.title.toLowerCase();

      if (titleLower.includes("bet") || titleLower.includes("place")) {
        increment = 1;
      } else if (titleLower.includes("win") && won) {
        increment = 1;
      } else if (titleLower.includes("wager") || titleLower.includes("play")) {
        increment = betAmount;
      }

      if (increment > 0) {
        const newProgress = Math.min(Number(m.progress || 0) + increment, Number(m.target));
        const completed = newProgress >= Number(m.target);
        const status = completed ? "completed" : "active";

        const { error: updErr } = await supabase
          .from("missions")
          .update({ progress: newProgress, completed, status })
          .eq("id", m.id);

        if (!updErr && completed) {
          emitToUser(userId.toString(), "missionCompletedNotification", {
            mission: {
              ...m,
              _id: m.id, // For legacy frontend compatibility
              progress: newProgress,
              completed,
              status,
            },
          });
        }
      }
    }
  } catch (err) {
    console.error("Failed to progress missions:", err.message);
  }
}

export async function updateStatsAfterGame(
  userId,
  { betAmount, payout, won, historyId = null },
) {
  // Retrieve profile
  const { data: user, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !user) throw new AppError("User not found", 404);

  const profit = payout - betAmount;
  const stats = user.stats || {
    totalBets: 0,
    totalWagered: 0,
    totalWins: 0,
    totalLosses: 0,
    gamesPlayed: 0,
    biggestWin: 0,
    profitLoss: 0,
  };

  stats.totalBets = (stats.totalBets || 0) + 1;
  stats.totalWagered = (stats.totalWagered || 0) + betAmount;
  stats.gamesPlayed = (stats.gamesPlayed || 0) + 1;
  stats.profitLoss = (stats.profitLoss || 0) + profit;

  if (won) {
    stats.totalWins = (stats.totalWins || 0) + 1;
    if (payout > (stats.biggestWin || 0)) {
      stats.biggestWin = payout;
    }
  } else {
    stats.totalLosses = (stats.totalLosses || 0) + 1;
    const lossAmount = betAmount;
    await recordLossCommission(userId, lossAmount, historyId);
  }

  // Update profile stats in DB
  const { error: updateErr } = await supabase
    .from("profiles")
    .update({ stats })
    .eq("id", userId);

  if (updateErr) throw new AppError("Failed to update user stats", 500);

  await progressMissions(userId, { betAmount, won }).catch(() => {});
  await checkAndUpgradeVip(userId);

  emitToUser(userId.toString(), "statsUpdated", { stats });

  return stats;
}

export function statsToResponse(stats) {
  if (!stats) return {};
  return {
    totalBets: stats.totalBets || 0,
    totalWagered: stats.totalWagered || 0,
    totalWins: stats.totalWins || 0,
    totalLosses: stats.totalLosses || 0,
    gamesPlayed: stats.gamesPlayed || 0,
    biggestWin: stats.biggestWin || 0,
    profitLoss: stats.profitLoss || 0,
  };
}
