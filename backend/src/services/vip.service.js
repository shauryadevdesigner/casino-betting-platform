import { VipTier } from "../models/VipTier.js";
import { User } from "../models/User.js";
import { emitToUser } from "./socket.service.js";
import { EmailTemplates } from "./email.service.js";

const TIER_ORDER = ["bronze", "silver", "gold", "platinum"];

export async function ensureVipTiersSeeded() {
  const count = await VipTier.countDocuments();
  if (count > 0) return;

  await VipTier.insertMany([
    {
      tierKey: "bronze",
      name: "Bronze",
      minWagered: 0,
      dailyRewardBonusPct: 1,
      affiliateCommissionRate: 0.05,
      benefits: ["1% daily reward bonus", "5% affiliate commission"],
    },
    {
      tierKey: "silver",
      name: "Silver",
      minWagered: 100,
      dailyRewardBonusPct: 2,
      affiliateCommissionRate: 0.07,
      benefits: ["2% daily bonus", "Silver badge", "7% affiliate"],
    },
    {
      tierKey: "gold",
      name: "Gold",
      minWagered: 500,
      dailyRewardBonusPct: 5,
      affiliateCommissionRate: 0.1,
      benefits: ["5% daily bonus", "Exclusive missions", "10% affiliate"],
    },
    {
      tierKey: "platinum",
      name: "Platinum",
      minWagered: 2000,
      dailyRewardBonusPct: 10,
      affiliateCommissionRate: 0.15,
      benefits: ["10% daily bonus", "VIP support", "15% affiliate"],
    },
  ]);
}

export async function resolveTierForWagered(totalWagered) {
  const tiers = await VipTier.find().sort({ minWagered: -1 }).lean();
  for (const t of tiers) {
    if (totalWagered >= t.minWagered) return t;
  }
  return tiers[tiers.length - 1];
}

export async function checkAndUpgradeVip(userId) {
  const user = await User.findById(userId);
  if (!user) return null;

  const tierConfig = await resolveTierForWagered(user.stats.totalWagered);
  if (!tierConfig || tierConfig.tierKey === user.vipTier) return user;

  const prev = user.vipTier;
  user.vipTier = tierConfig.tierKey;
  user.vipTierUpdatedAt = new Date();
  user.affiliateCommissionRate = tierConfig.affiliateCommissionRate;
  await user.save();

  emitToUser(userId, "tierUpgrade", {
    previousTier: prev,
    newTier: tierConfig.tierKey,
    benefits: tierConfig.benefits,
  });
  emitToUser(userId, "vipBenefitsUnlocked", { tier: tierConfig });

  EmailTemplates.vipUpgrade(user.email, {
    name: user.displayName,
    tier: tierConfig.name,
  });

  return user;
}

export function getDailyRewardMultiplier(vipTier) {
  const map = { bronze: 1.01, silver: 1.02, gold: 1.05, platinum: 1.1 };
  return map[vipTier] ?? 1;
}

export async function getAllTiers() {
  return VipTier.find().sort({ minWagered: 1 }).lean();
}

export function getNextTier(currentKey, tiers) {
  const idx = TIER_ORDER.indexOf(currentKey);
  return tiers.find((t) => TIER_ORDER.indexOf(t.tierKey) === idx + 1) ?? null;
}
