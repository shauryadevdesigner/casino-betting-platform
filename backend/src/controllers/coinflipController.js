import { GameHistory } from "../models/GameHistory.js";
import { deductBet, creditWin } from "../services/walletService.js";
import { updateStatsAfterGame } from "../services/statsService.js";
import { flipCoin } from "../utils/gameMath.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../middleware/errorHandler.js";

const VALID_CHOICES = ["heads", "tails"];

export const playCoinFlip = asyncHandler(async (req, res) => {
  const betAmount = Number(req.body.betAmount);
  const choice = req.body.choice?.toLowerCase();

  if (!betAmount || betAmount <= 0) throw new AppError("Valid bet amount required");
  if (!VALID_CHOICES.includes(choice)) {
    throw new AppError("Choice must be heads or tails");
  }

  await deductBet(req.user._id, betAmount, "coinflip", { choice });

  const result = flipCoin();
  const won = result === choice;
  const multiplier = 2;
  const payout = won ? betAmount * multiplier : 0;

  if (won) {
    await creditWin(req.user._id, payout, "coinflip", { result, choice });
  }

  const history = await GameHistory.create({
    userId: req.user._id,
    game: "coinflip",
    betAmount,
    payout,
    profit: payout - betAmount,
    won,
    multiplier: won ? multiplier : 0,
    result: { choice, result },
    status: "completed",
  });

  const stats = await updateStatsAfterGame(req.user._id, { betAmount, payout, won });
  const user = await req.user.constructor.findById(req.user._id);

  res.json({
    success: true,
    choice,
    result,
    won,
    multiplier,
    payout,
    profit: payout - betAmount,
    balance: user.balance,
    historyId: history._id,
    stats,
  });
});
