import { MinesSession } from "../models/MinesSession.js";
import { GameHistory } from "../models/GameHistory.js";
import { deductBet, creditWin } from "../services/walletService.js";
import { updateStatsAfterGame } from "../services/statsService.js";
import {
  generateMinePositions,
  minesMultiplier,
  GRID_SIZE,
} from "../utils/gameMath.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../middleware/errorHandler.js";

export const startMines = asyncHandler(async (req, res) => {
  const betAmount = Number(req.body.betAmount);
  const mineCount = Number(req.body.mineCount) || 3;

  if (!betAmount || betAmount <= 0) throw new AppError("Valid bet amount required");
  if (mineCount < 1 || mineCount > 24) throw new AppError("Mine count must be 1-24");

  const active = await MinesSession.findOne({
    userId: req.user._id,
    status: "active",
  });
  if (active) throw new AppError("Finish your current mines game first", 400);

  await deductBet(req.user._id, betAmount, "mines", { mineCount });

  const session = await MinesSession.create({
    userId: req.user._id,
    betAmount,
    mineCount,
    gridSize: GRID_SIZE,
    minePositions: generateMinePositions(mineCount, GRID_SIZE),
    revealedTiles: [],
    multiplier: 1,
    status: "active",
  });

  const user = await req.user.constructor.findById(req.user._id);
  res.status(201).json({
    success: true,
    gameId: session._id,
    gridSize: GRID_SIZE,
    mineCount,
    betAmount,
    balance: user.balance,
  });
});

export const revealTile = asyncHandler(async (req, res) => {
  const tileIndex = Number(req.body.tileIndex);
  const gameId = req.params.gameId;

  if (tileIndex < 0 || tileIndex >= GRID_SIZE) {
    throw new AppError("Invalid tile index");
  }

  const session = await MinesSession.findOne({
    _id: gameId,
    userId: req.user._id,
    status: "active",
  }).select("+minePositions");

  if (!session) throw new AppError("Active game not found", 404);
  if (session.revealedTiles.includes(tileIndex)) {
    throw new AppError("Tile already revealed");
  }

  session.revealedTiles.push(tileIndex);
  const hitMine = session.minePositions.includes(tileIndex);
  const safeRevealed = session.revealedTiles.filter(
    (i) => !session.minePositions.includes(i),
  ).length;

  session.multiplier = minesMultiplier(session.gridSize, session.mineCount, safeRevealed);

  if (hitMine) {
    session.status = "lost";
    await session.save();

    await GameHistory.create({
      userId: req.user._id,
      game: "mines",
      betAmount: session.betAmount,
      payout: 0,
      profit: -session.betAmount,
      won: false,
      multiplier: 0,
      result: {
        minePositions: session.minePositions,
        revealedTiles: session.revealedTiles,
        hitTile: tileIndex,
      },
      status: "lost",
    });

    const stats = await updateStatsAfterGame(req.user._id, {
      betAmount: session.betAmount,
      payout: 0,
      won: false,
    });

    const user = await req.user.constructor.findById(req.user._id);
    return res.json({
      success: true,
      hitMine: true,
      gameOver: true,
      status: "lost",
      tileIndex,
      minePositions: session.minePositions,
      revealedTiles: session.revealedTiles,
      balance: user.balance,
      stats,
    });
  }

  await session.save();
  res.json({
    success: true,
    hitMine: false,
    gameOver: false,
    status: "active",
    tileIndex,
    revealedTiles: session.revealedTiles,
    safeRevealed,
    multiplier: session.multiplier,
  });
});

export const cashoutMines = asyncHandler(async (req, res) => {
  const gameId = req.params.gameId;

  const session = await MinesSession.findOne({
    _id: gameId,
    userId: req.user._id,
    status: "active",
  }).select("+minePositions");

  if (!session) throw new AppError("Active game not found", 404);

  const safeRevealed = session.revealedTiles.filter(
    (i) => !session.minePositions.includes(i),
  ).length;

  if (safeRevealed === 0) throw new AppError("Reveal at least one safe tile before cashout");

  const payout = +(session.betAmount * session.multiplier).toFixed(2);
  await creditWin(req.user._id, payout, "mines", {
    gameId,
    multiplier: session.multiplier,
  });

  session.status = "cashed_out";
  await session.save();

  const history = await GameHistory.create({
    userId: req.user._id,
    game: "mines",
    betAmount: session.betAmount,
    payout,
    profit: payout - session.betAmount,
    won: true,
    multiplier: session.multiplier,
    result: {
      revealedTiles: session.revealedTiles,
      safeRevealed,
      mineCount: session.mineCount,
    },
    status: "cashed_out",
  });

  const stats = await updateStatsAfterGame(req.user._id, {
    betAmount: session.betAmount,
    payout,
    won: true,
  });

  const user = await req.user.constructor.findById(req.user._id);
  res.json({
    success: true,
    status: "cashed_out",
    payout,
    multiplier: session.multiplier,
    profit: payout - session.betAmount,
    balance: user.balance,
    historyId: history._id,
    stats,
  });
});
