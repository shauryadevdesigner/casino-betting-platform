import { supabase } from "../lib/supabase.js";
import { deductBet, creditWin } from "../services/walletService.js";
import { updateStatsAfterGame } from "../services/statsService.js";
import { diceMultiplier, diceWins } from "../utils/gameMath.js";
import {
  generateServerSeed,
  buildFairnessProof,
  rollFromHash,
} from "../services/provablyFair.service.js";
import { emitToUser } from "../services/socket.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../middleware/errorHandler.js";

export const playDice = asyncHandler(async (req, res) => {
  const betAmount = Number(req.body.betAmount);
  const target = Number(req.body.target);
  const mode = req.body.mode;
  const clientSeed = req.body.clientSeed || "default";

  if (!betAmount || betAmount <= 0) throw new AppError("Valid bet amount required", 400);
  if (!["under", "over"].includes(mode)) throw new AppError("Mode must be under or over", 400);
  if (target < 2 || target > 98) throw new AppError("Target must be between 2 and 98", 400);

  emitToUser(req.user._id.toString(), "placeBet", { game: "dice", betAmount });

  await deductBet(req.user._id, betAmount, "dice", { target, mode });

  const serverSeed = generateServerSeed();
  const { combinedHash } = buildFairnessProof(serverSeed, clientSeed);
  const roll = +rollFromHash(combinedHash, 0, 100).toFixed(2);
  const multiplier = diceMultiplier(target, mode);
  const won = diceWins(roll, target, mode);
  const payout = won ? +(betAmount * multiplier).toFixed(2) : 0;

  if (won) {
    await creditWin(req.user._id, payout, "dice", { roll, target, mode, multiplier });
  }

  // Insert game history in public.game_histories
  const { data: history, error: historyErr } = await supabase
    .from("game_histories")
    .insert({
      user_id: req.user._id,
      game: "dice",
      bet_amount: betAmount,
      payout,
      profit: payout - betAmount,
      won,
      multiplier: won ? multiplier : 0,
      result: { roll, target, mode },
      server_seed: serverSeed,
      client_seed: clientSeed,
      combined_hash: combinedHash,
      status: "completed",
    })
    .select()
    .single();

  if (historyErr) throw new AppError("Failed to save game history", 500);

  const stats = await updateStatsAfterGame(req.user._id, {
    betAmount,
    payout,
    won,
    historyId: history.id,
  });

  // Fetch updated balance from wallets
  const { data: wallet } = await supabase
    .from("wallets")
    .select("balance")
    .eq("user_id", req.user._id)
    .single();

  const balance = Number(wallet?.balance ?? 1000);

  const payload = {
    success: true,
    roll,
    target,
    mode,
    multiplier,
    won,
    payout,
    profit: payout - betAmount,
    balance,
    historyId: history.id,
    stats,
    fairness: { serverSeed, clientSeed, combinedHash },
  };

  emitToUser(req.user._id.toString(), "gameResult", payload);

  res.json(payload);
});
