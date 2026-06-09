import { getAllTiers, getNextTier, resolveTierForWagered } from "../services/vip.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { recordTransaction } from "../services/walletService.js";
import { supabase } from "../lib/supabase.js";
import { AppError } from "../middleware/errorHandler.js";
import { userToPublicJSON } from "../utils/userMapper.js";

const VIP_COSTS = {
  bronze: 100,
  silver: 250,
  gold: 500,
  platinum: 1000,
};

const TIER_ORDER = ["bronze", "silver", "gold", "platinum"];

export const listTiers = asyncHandler(async (req, res) => {
  const tiers = await getAllTiers();
  const totalWagered = Number(req.user.stats?.totalWagered ?? 0);
  const current = await resolveTierForWagered(totalWagered);
  const vipTier = req.user.vip_tier || req.user.vipTier || "bronze";
  const next = getNextTier(vipTier, tiers);

  res.json({
    success: true,
    currentTier: vipTier,
    totalWagered,
    tiers,
    current,
    next,
    progressToNext: next
      ? Math.min(100, (totalWagered / next.minWagered) * 100)
      : 100,
  });
});

export const buyVipTier = asyncHandler(async (req, res) => {
  const { tierKey } = req.body;
  if (!tierKey || !VIP_COSTS[tierKey]) {
    throw new AppError("Invalid VIP tier key specified", 400);
  }

  const { data: user, error } = await supabase
    .from("profiles")
    .select("*, wallets(balance)")
    .eq("id", req.user._id)
    .single();

  if (error || !user) throw new AppError("User not found", 404);

  const currentTier = user.vip_tier || "bronze";
  const currentIdx = TIER_ORDER.indexOf(currentTier);
  const targetIdx = TIER_ORDER.indexOf(tierKey);

  if (targetIdx <= currentIdx && user.vip_tier) {
    throw new AppError("You cannot purchase a tier lower than or equal to your current VIP tier", 400);
  }

  const cost = VIP_COSTS[tierKey];

  // Deduct balance and record transaction
  await recordTransaction({
    userId: user.id,
    type: "adjustment",
    amount: -cost,
    metadata: { action: "buy_vip", tier: tierKey },
  });

  // Fetch appropriate affiliateCommissionRate for the new tier
  const tiers = await getAllTiers();
  const tierConfig = tiers.find((t) => t.tier_key === tierKey);
  const commissionRate = tierConfig ? Number(tierConfig.affiliate_commission_rate) : 0.05;

  // Upgrade the user in DB
  const { data: updatedUser, error: updateErr } = await supabase
    .from("profiles")
    .update({
      vip_tier: tierKey,
      vip_tier_updated_at: new Date().toISOString(),
      affiliate_commission_rate: commissionRate,
    })
    .eq("id", req.user._id)
    .select("*, wallets(balance)")
    .single();

  if (updateErr) throw new AppError("Failed to update VIP tier", 500);

  // Sync to user_vip table
  const { data: vipLevel } = await supabase
    .from("vip_levels")
    .select("id")
    .ilike("name", tierKey)
    .maybeSingle();

  if (vipLevel) {
    await supabase
      .from("user_vip")
      .upsert({ user_id: req.user._id, vip_level: vipLevel.id }, { onConflict: "user_id" });
  }

  res.json({
    success: true,
    message: `Successfully upgraded to VIP ${tierKey.toUpperCase()}!`,
    user: userToPublicJSON(updatedUser),
  });
});
