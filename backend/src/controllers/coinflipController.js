import { supabase } from "../lib/supabase.js";
import { deductBet, creditWin } from "../services/walletService.js";
import { updateStatsAfterGame } from "../services/statsService.js";
import { flipCoin } from "../utils/gameMath.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../middleware/errorHandler.js";

const VALID_CHOICES = ["heads", "tails"];

export const playCoinFlip = asyncHandler(async (req, res) => {
  const betAmount = Number(req.body.betAmount);
  const choice = req.body.choice?.toLowerCase();

  if (!betAmount || betAmount <= 0) throw new AppError("Valid bet amount required", 400);
  if (!VALID_CHOICES.includes(choice)) {
    throw new AppError("Choice must be heads or tails", 400);
  }

  await deductBet(req.user._id, betAmount, "coinflip", { choice });

  const result = flipCoin();
  const won = result === choice;
  const multiplier = 2;
  const payout = won ? betAmount * multiplier : 0;

  if (won) {
    await creditWin(req.user._id, payout, "coinflip", { result, choice });
  }

  // Insert game history
  const { data: history, error: historyErr } = await supabase
    .from("game_histories")
    .insert({
      user_id: req.user._id,
      game: "coinflip",
      bet_amount: betAmount,
      payout,
      profit: payout - betAmount,
      won,
      multiplier: won ? multiplier : 0,
      result: { choice, result },
      status: "completed",
    })
    .select()
    .single();

  if (historyErr) throw new AppError("Failed to save game history", 500);

  const stats = await updateStatsAfterGame(req.user._id, { betAmount, payout, won });

  // Get updated balance
  const { data: wallet } = await supabase
    .from("wallets")
    .select("balance")
    .eq("user_id", req.user._id)
    .single();

  const balance = Number(wallet?.balance ?? 1000);

  res.json({
    success: true,
    choice,
    result,
    won,
    multiplier,
    payout,
    profit: payout - betAmount,
    balance,
    historyId: history.id,
    stats,
  });
});
