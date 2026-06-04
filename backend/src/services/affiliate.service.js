import crypto from "crypto";
import { User } from "../models/User.js";
import { Referral } from "../models/Referral.js";
import { AffiliateCommission } from "../models/AffiliateCommission.js";
import { emitToUser } from "./socket.service.js";
import { recordTransaction } from "./walletService.js";
import { AppError } from "../middleware/errorHandler.js";

export function generateReferralCode(username) {
  const suffix = crypto.randomBytes(3).toString("hex").toUpperCase();
  const base = username.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toUpperCase();
  return `${base}_${suffix}`;
}

export async function ensureReferralCode(user) {
  if (user.referralCode) return user.referralCode;
  let code = generateReferralCode(user.username);
  while (await User.exists({ referralCode: code })) {
    code = generateReferralCode(user.username);
  }
  user.referralCode = code;
  await user.save();
  return code;
}

export async function applyReferralCode(newUser, code) {
  if (!code) return;
  const referrer = await User.findOne({ referralCode: code.toUpperCase() });
  if (!referrer || referrer._id.equals(newUser._id)) return;

  newUser.referredByUserId = referrer._id;
  await newUser.save();

  await Referral.create({
    referrerId: referrer._id,
    referredId: newUser._id,
    commissionRate: referrer.affiliateCommissionRate,
  });

  emitToUser(referrer._id.toString(), "newReferral", {
    referredUsername: newUser.username,
  });
}

export async function recordLossCommission(referredUserId, lossAmount, gameHistoryId) {
  if (lossAmount <= 0) return;

  const referred = await User.findById(referredUserId);
  if (!referred?.referredByUserId) return;

  const referrer = await User.findById(referred.referredByUserId);
  if (!referrer) return;

  const rate = referrer.affiliateCommissionRate ?? 0.05;
  const commissionAmount = +(lossAmount * rate).toFixed(2);
  if (commissionAmount <= 0) return;

  referrer.affiliateEarnings += commissionAmount;
  await referrer.save();

  await AffiliateCommission.create({
    referrerId: referrer._id,
    referredId: referred._id,
    gameHistoryId,
    lossAmount,
    commissionRate: rate,
    commissionAmount,
  });

  await Referral.findOneAndUpdate(
    { referrerId: referrer._id, referredId: referred._id },
    { $inc: { totalCommission: commissionAmount } },
  );

  emitToUser(referrer._id.toString(), "affiliateEarningsUpdated", {
    affiliateEarnings: referrer.affiliateEarnings,
    commissionAmount,
  });
}

export async function withdrawAffiliateEarnings(userId) {
  const user = await User.findById(userId);
  if (!user || user.affiliateEarnings <= 0) {
    throw new AppError("No affiliate earnings to withdraw", 400);
  }

  const amount = user.affiliateEarnings;
  user.affiliateEarnings = 0;
  await user.save();

  await recordTransaction({
    userId,
    type: "affiliate_payout",
    amount,
    metadata: { source: "affiliate_withdrawal" },
  });

  return amount;
}

export async function getAffiliateDashboard(userId) {
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);

  const code = await ensureReferralCode(user);
  const referrals = await Referral.find({ referrerId: userId })
    .populate("referredId", "username displayName createdAt stats.totalWagered")
    .sort({ createdAt: -1 })
    .lean();

  const commissions = await AffiliateCommission.find({ referrerId: userId })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return {
    referralCode: code,
    affiliateEarnings: user.affiliateEarnings,
    commissionRate: user.affiliateCommissionRate,
    referrals,
    commissions,
    totalReferrals: referrals.length,
  };
}
