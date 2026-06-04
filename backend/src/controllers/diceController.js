import { GameHistory } from "../models/GameHistory.js";
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

  if (!betAmount || betAmount <= 0) throw new AppError("Valid bet amount required");
  if (!["under", "over"].includes(mode)) throw new AppError("Mode must be under or over");
  if (target < 2 || target > 98) throw new AppError("Target must be between 2 and 98");

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

  const history = await GameHistory.create({
    userId: req.user._id,
    game: "dice",
    betAmount,
    payout,
    profit: payout - betAmount,
    won,
    multiplier: won ? multiplier : 0,
    result: { roll, target, mode },
    serverSeed,
    clientSeed,
    combinedHash,
    status: "completed",
  });

  const stats = await updateStatsAfterGame(req.user._id, {
    betAmount,
    payout,
    won,
    historyId: history._id,
  });

  const user = await req.user.constructor.findById(req.user._id);

  const payload = {
    success: true,
    roll,
    target,
    mode,
    multiplier,
    won,
    payout,
    profit: payout - betAmount,
    balance: user.balance,
    historyId: history._id,
    stats,
    fairness: { serverSeed, clientSeed, combinedHash },
  };

  emitToUser(req.user._id.toString(), "gameResult", payload);

  res.json(payload);
});
