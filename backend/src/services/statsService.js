import { User } from "../models/User.js";
import { AppError } from "../middleware/errorHandler.js";
import { checkAndUpgradeVip } from "./vip.service.js";
import { recordLossCommission } from "./affiliate.service.js";
import { emitToUser } from "./socket.service.js";

export async function updateStatsAfterGame(
  userId,
  { betAmount, payout, won, historyId = null },
) {
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);

  const profit = payout - betAmount;

  user.stats.totalBets += 1;
  user.stats.totalWagered += betAmount;
  user.stats.gamesPlayed += 1;
  user.stats.profitLoss += profit;

  if (won) {
    user.stats.totalWins += 1;
    if (payout > user.stats.biggestWin) {
      user.stats.biggestWin = payout;
    }
  } else {
    user.stats.totalLosses += 1;
    const lossAmount = betAmount;
    await recordLossCommission(userId, lossAmount, historyId);
  }

  await user.save();
  await checkAndUpgradeVip(userId);

  emitToUser(userId.toString(), "statsUpdated", { stats: user.stats });

  return user.stats;
}

export function statsToResponse(stats) {
  return {
    totalBets: stats.totalBets,
    totalWagered: stats.totalWagered,
    totalWins: stats.totalWins,
    totalLosses: stats.totalLosses,
    gamesPlayed: stats.gamesPlayed,
    biggestWin: stats.biggestWin,
    profitLoss: stats.profitLoss,
  };
}
