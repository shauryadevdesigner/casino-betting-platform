import { supabase } from "../lib/supabase.js";
import { recordTransaction } from "../services/walletService.js";
import { getDailyRewardMultiplier } from "../services/vip.service.js";
import { EmailTemplates } from "../services/email.service.js";
import { emitToUser } from "../services/socket.service.js";
import { env } from "../config/env.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../middleware/errorHandler.js";

const COOLDOWN_MS = 24 * 60 * 60 * 1000;

export const getDailyStatus = asyncHandler(async (req, res) => {
  const lastStr = req.user.last_daily_claim_at || req.user.lastDailyClaimAt;
  const last = lastStr ? new Date(lastStr) : null;
  const now = Date.now();
  const canClaim = !last || now - last.getTime() >= COOLDOWN_MS;
  const nextClaimAt = last ? new Date(last.getTime() + COOLDOWN_MS) : null;

  res.json({
    success: true,
    canClaim,
    rewardAmount: env.dailyRewardAmount,
    lastClaimAt: last,
    nextClaimAt: canClaim ? null : nextClaimAt,
  });
});

export const claimDailyReward = asyncHandler(async (req, res) => {
  const lastStr = req.user.last_daily_claim_at || req.user.lastDailyClaimAt;
  const last = lastStr ? new Date(lastStr) : null;
  const now = Date.now();

  if (last && now - last.getTime() < COOLDOWN_MS) {
    throw new AppError("Daily reward already claimed. Try again in 24 hours.", 400);
  }

  const vipTier = req.user.vip_tier || req.user.vipTier || "bronze";
  const multiplier = getDailyRewardMultiplier(vipTier);
  const amount = +(env.dailyRewardAmount * multiplier).toFixed(2);

  const { balanceAfter } = await recordTransaction({
    userId: req.user._id,
    type: "daily_reward",
    amount,
    metadata: { source: "daily_login", vipTier },
  });

  emitToUser(req.user._id.toString(), "dailyRewardClaim", { amount, balance: balanceAfter });
  
  EmailTemplates.dailyRewardClaim(req.user.email, {
    amount: `$${amount}`,
    name: req.user.display_name || req.user.username,
  });

  const lastClaimTime = new Date();

  // Update profile
  await supabase
    .from("profiles")
    .update({ last_daily_claim_at: lastClaimTime.toISOString() })
    .eq("id", req.user._id);

  // Insert daily reward log
  await supabase.from("daily_rewards").insert({
    user_id: req.user._id,
    amount,
    claimed_at: lastClaimTime.toISOString(),
  });

  res.json({
    success: true,
    amount,
    balance: balanceAfter,
    claimedAt: lastClaimTime,
    nextClaimAt: new Date(now + COOLDOWN_MS),
  });
});
