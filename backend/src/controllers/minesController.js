import { supabase } from "../lib/supabase.js";
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

  if (!betAmount || betAmount <= 0) throw new AppError("Valid bet amount required", 400);
  if (mineCount < 1 || mineCount > 24) throw new AppError("Mine count must be 1-24", 400);

  // Check active session
  const { data: active, error: checkErr } = await supabase
    .from("mines_sessions")
    .select("id")
    .eq("user_id", req.user._id)
    .eq("status", "active")
    .maybeSingle();

  if (active) throw new AppError("Finish your current mines game first", 400);

  await deductBet(req.user._id, betAmount, "mines", { mineCount });

  // Create active session
  const { data: session, error: createErr } = await supabase
    .from("mines_sessions")
    .insert({
      user_id: req.user._id,
      bet_amount: betAmount,
      mine_count: mineCount,
      grid_size: GRID_SIZE,
      mine_positions: generateMinePositions(mineCount, GRID_SIZE),
      revealed_tiles: [],
      multiplier: 1,
      status: "active",
    })
    .select()
    .single();

  if (createErr) throw new AppError("Failed to start mines session", 500);

  // Get updated balance
  const { data: wallet } = await supabase
    .from("wallets")
    .select("balance")
    .eq("user_id", req.user._id)
    .single();

  const balance = Number(wallet?.balance ?? 1000);

  res.status(201).json({
    success: true,
    gameId: session.id,
    gridSize: GRID_SIZE,
    mineCount,
    betAmount,
    balance,
  });
});

export const revealTile = asyncHandler(async (req, res) => {
  const tileIndex = Number(req.body.tileIndex);
  const gameId = req.params.gameId;

  if (tileIndex < 0 || tileIndex >= GRID_SIZE) {
    throw new AppError("Invalid tile index", 400);
  }

  const { data: session, error } = await supabase
    .from("mines_sessions")
    .select("*")
    .eq("id", gameId)
    .eq("user_id", req.user._id)
    .eq("status", "active")
    .maybeSingle();

  if (error || !session) throw new AppError("Active game not found", 404);

  const revealedTiles = session.revealed_tiles || [];
  if (revealedTiles.includes(tileIndex)) {
    throw new AppError("Tile already revealed", 400);
  }

  revealedTiles.push(tileIndex);
  const minePositions = session.mine_positions || [];
  const hitMine = minePositions.includes(tileIndex);
  const safeRevealed = revealedTiles.filter(
    (i) => !minePositions.includes(i),
  ).length;

  const multiplier = minesMultiplier(session.grid_size, session.mine_count, safeRevealed);

  if (hitMine) {
    await supabase
      .from("mines_sessions")
      .update({
        status: "lost",
        revealed_tiles: revealedTiles,
        multiplier: 0,
      })
      .eq("id", session.id);

    // Insert game history
    const { data: history } = await supabase
      .from("game_histories")
      .insert({
        user_id: req.user._id,
        game: "mines",
        bet_amount: session.bet_amount,
        payout: 0,
        profit: -session.bet_amount,
        won: false,
        multiplier: 0,
        result: {
          minePositions,
          revealedTiles,
          hitTile: tileIndex,
        },
        status: "lost",
      })
      .select()
      .single();

    const stats = await updateStatsAfterGame(req.user._id, {
      betAmount: session.bet_amount,
      payout: 0,
      won: false,
    });

    const { data: wallet } = await supabase
      .from("wallets")
      .select("balance")
      .eq("user_id", req.user._id)
      .single();

    const balance = Number(wallet?.balance ?? 1000);

    return res.json({
      success: true,
      hitMine: true,
      gameOver: true,
      status: "lost",
      tileIndex,
      minePositions,
      revealedTiles,
      balance,
      stats,
    });
  }

  await supabase
    .from("mines_sessions")
    .update({
      revealed_tiles: revealedTiles,
      multiplier,
    })
    .eq("id", session.id);

  res.json({
    success: true,
    hitMine: false,
    gameOver: false,
    status: "active",
    tileIndex,
    revealedTiles,
    safeRevealed,
    multiplier,
  });
});

export const cashoutMines = asyncHandler(async (req, res) => {
  const gameId = req.params.gameId;

  const { data: session, error } = await supabase
    .from("mines_sessions")
    .select("*")
    .eq("id", gameId)
    .eq("user_id", req.user._id)
    .eq("status", "active")
    .maybeSingle();

  if (error || !session) throw new AppError("Active game not found", 404);

  const revealedTiles = session.revealed_tiles || [];
  const minePositions = session.mine_positions || [];
  const safeRevealed = revealedTiles.filter(
    (i) => !minePositions.includes(i),
  ).length;

  if (safeRevealed === 0) throw new AppError("Reveal at least one safe tile before cashout", 400);

  const payout = +(session.bet_amount * session.multiplier).toFixed(2);
  await creditWin(req.user._id, payout, "mines", {
    gameId,
    multiplier: session.multiplier,
  });

  await supabase
    .from("mines_sessions")
    .update({ status: "cashed_out" })
    .eq("id", session.id);

  // Insert game history
  const { data: history } = await supabase
    .from("game_histories")
    .insert({
      user_id: req.user._id,
      game: "mines",
      bet_amount: session.bet_amount,
      payout,
      profit: payout - session.bet_amount,
      won: true,
      multiplier: session.multiplier,
      result: {
        revealedTiles,
        safeRevealed,
        mineCount: session.mine_count,
      },
      status: "cashed_out",
    })
    .select()
    .single();

  const stats = await updateStatsAfterGame(req.user._id, {
    betAmount: session.bet_amount,
    payout,
    won: true,
  });

  const { data: wallet } = await supabase
    .from("wallets")
    .select("balance")
    .eq("user_id", req.user._id)
    .single();

  const balance = Number(wallet?.balance ?? 1000);

  res.json({
    success: true,
    status: "cashed_out",
    payout,
    multiplier: session.multiplier,
    profit: payout - session.bet_amount,
    balance,
    historyId: history.id,
    stats,
  });
});
