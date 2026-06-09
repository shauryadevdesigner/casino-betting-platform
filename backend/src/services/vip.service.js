import { supabase } from "../lib/supabase.js";
import { emitToUser } from "./socket.service.js";
import { EmailTemplates } from "./email.service.js";

const TIER_ORDER = ["bronze", "silver", "gold", "platinum"];

export async function ensureVipTiersSeeded() {
  const { count, error } = await supabase
    .from("vip_tiers")
    .select("*", { count: "exact", head: true });

  if (error || count > 0) return;

  const defaultTiers = [
    {
      tier_key: "bronze",
      name: "Bronze",
      min_wagered: 0,
      daily_reward_bonus_pct: 1,
      affiliate_commission_rate: 0.05,
      benefits: ["1% daily reward bonus", "5% affiliate commission"],
    },
    {
      tier_key: "silver",
      name: "Silver",
      min_wagered: 100,
      daily_reward_bonus_pct: 2,
      affiliate_commission_rate: 0.07,
      benefits: ["2% daily bonus", "Silver badge", "7% affiliate"],
    },
    {
      tier_key: "gold",
      name: "Gold",
      min_wagered: 500,
      daily_reward_bonus_pct: 5,
      affiliate_commission_rate: 0.1,
      benefits: ["5% daily bonus", "Exclusive missions", "10% affiliate"],
    },
    {
      tier_key: "platinum",
      name: "Platinum",
      min_wagered: 2000,
      daily_reward_bonus_pct: 10,
      affiliate_commission_rate: 0.15,
      benefits: ["10% daily bonus", "VIP support", "15% affiliate"],
    },
  ];

  await supabase.from("vip_tiers").insert(defaultTiers);
}

export async function resolveTierForWagered(totalWagered) {
  const { data: tiers, error } = await supabase
    .from("vip_tiers")
    .select("*")
    .order("min_wagered", { ascending: false });

  if (error || !tiers) return null;

  for (const t of tiers) {
    if (Number(totalWagered) >= Number(t.min_wagered)) {
      // Map to legacy tierKey
      return {
        ...t,
        tierKey: t.tier_key,
        dailyRewardBonusPct: Number(t.daily_reward_bonus_pct),
        affiliateCommissionRate: Number(t.affiliate_commission_rate),
        minWagered: Number(t.min_wagered),
      };
    }
  }

  const fallback = tiers[tiers.length - 1];
  return fallback ? {
    ...fallback,
    tierKey: fallback.tier_key,
    dailyRewardBonusPct: Number(fallback.daily_reward_bonus_pct),
    affiliateCommissionRate: Number(fallback.affiliate_commission_rate),
    minWagered: Number(fallback.min_wagered),
  } : null;
}

export async function checkAndUpgradeVip(userId) {
  const { data: user, error: userErr } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (userErr || !user) return null;

  const totalWagered = Number(user.stats?.totalWagered ?? 0);
  const tierConfig = await resolveTierForWagered(totalWagered);
  if (!tierConfig || tierConfig.tier_key === user.vip_tier) return user;

  const prev = user.vip_tier;

  const { error: updateErr } = await supabase
    .from("profiles")
    .update({
      vip_tier: tierConfig.tier_key,
      vip_tier_updated_at: new Date(),
      affiliate_commission_rate: tierConfig.affiliate_commission_rate,
    })
    .eq("id", userId);

  if (updateErr) return user;

  // Also sync to user_vip table
  const { data: vipLevel } = await supabase
    .from("vip_levels")
    .select("id")
    .ilike("name", tierConfig.tier_key)
    .maybeSingle();

  if (vipLevel) {
    await supabase
      .from("user_vip")
      .upsert({ user_id: userId, vip_level: vipLevel.id }, { onConflict: "user_id" });
  }

  emitToUser(userId.toString(), "tierUpgrade", {
    previousTier: prev,
    newTier: tierConfig.tier_key,
    benefits: tierConfig.benefits,
  });
  emitToUser(userId.toString(), "vipBenefitsUnlocked", {
    tier: {
      ...tierConfig,
      tierKey: tierConfig.tier_key,
      dailyRewardBonusPct: Number(tierConfig.daily_reward_bonus_pct),
      affiliateCommissionRate: Number(tierConfig.affiliate_commission_rate),
      minWagered: Number(tierConfig.min_wagered),
    },
  });

  EmailTemplates.vipUpgrade(user.email, {
    name: user.display_name || user.username,
    tier: tierConfig.name,
  });

  return { ...user, vip_tier: tierConfig.tier_key };
}

export function getDailyRewardMultiplier(vipTier) {
  const map = { bronze: 1.01, silver: 1.02, gold: 1.05, platinum: 1.1 };
  return map[vipTier] ?? 1;
}

export async function getAllTiers() {
  const { data, error } = await supabase
    .from("vip_tiers")
    .select("*")
    .order("min_wagered", { ascending: true });

  if (error || !data) return [];

  return data.map((t) => ({
    ...t,
    tierKey: t.tier_key,
    dailyRewardBonusPct: Number(t.daily_reward_bonus_pct),
    affiliateCommissionRate: Number(t.affiliate_commission_rate),
    minWagered: Number(t.min_wagered),
  }));
}

export function getNextTier(currentKey, tiers) {
  const idx = TIER_ORDER.indexOf(currentKey);
  return tiers.find((t) => TIER_ORDER.indexOf(t.tierKey) === idx + 1) ?? null;
}
