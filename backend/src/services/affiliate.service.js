import crypto from "crypto";
import { supabase } from "../lib/supabase.js";
import { emitToUser } from "./socket.service.js";
import { recordTransaction } from "./walletService.js";
import { AppError } from "../middleware/errorHandler.js";

export function generateReferralCode(username) {
  const suffix = crypto.randomBytes(3).toString("hex").toUpperCase();
  const base = username.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toUpperCase();
  return `${base}_${suffix}`;
}

export async function ensureReferralCode(user) {
  if (user.referral_code) return user.referral_code;

  let code = generateReferralCode(user.username);
  while (true) {
    const { data: exists } = await supabase
      .from("profiles")
      .select("id")
      .eq("referral_code", code)
      .maybeSingle();

    if (!exists) break;
    code = generateReferralCode(user.username);
  }

  const { error } = await supabase
    .from("profiles")
    .update({ referral_code: code })
    .eq("id", user.id);

  if (error) throw new AppError("Failed to generate referral code", 500);

  return code;
}

export async function applyReferralCode(newUser, code) {
  if (!code) return;

  const { data: referrer, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("referral_code", code.toUpperCase())
    .maybeSingle();

  if (error || !referrer || referrer.id === newUser.id) return;

  // Set referred_by_user_id on new user profile
  await supabase
    .from("profiles")
    .update({ referred_by_user_id: referrer.id })
    .eq("id", newUser.id);

  // Create referrals table entry
  await supabase.from("referrals").insert({
    referrer_id: referrer.id,
    referred_id: newUser.id,
    commission_rate: referrer.affiliate_commission_rate || 0.05,
    total_commission: 0,
    status: "active",
  });

  emitToUser(referrer.id, "newReferral", {
    referredUsername: newUser.username,
  });
}

export async function recordLossCommission(referredUserId, lossAmount, gameHistoryId) {
  if (lossAmount <= 0) return;

  // Retrieve referred user to check if they have a referrer
  const { data: referred } = await supabase
    .from("profiles")
    .select("referred_by_user_id")
    .eq("id", referredUserId)
    .single();

  if (!referred?.referred_by_user_id) return;

  // Retrieve referrer profile
  const { data: referrer } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", referred.referred_by_user_id)
    .single();

  if (!referrer) return;

  const rate = Number(referrer.affiliate_commission_rate ?? 0.05);
  const commissionAmount = +(lossAmount * rate).toFixed(2);
  if (commissionAmount <= 0) return;

  // Increment affiliate earnings for referrer
  const newEarnings = Number(referrer.affiliate_earnings ?? 0) + commissionAmount;
  await supabase
    .from("profiles")
    .update({ affiliate_earnings: newEarnings })
    .eq("id", referrer.id);

  // Insert affiliate commission record
  await supabase.from("affiliate_commissions").insert({
    referrer_id: referrer.id,
    referred_id: referredUserId,
    game_history_id: gameHistoryId,
    loss_amount: lossAmount,
    commission_rate: rate,
    commission_amount: commissionAmount,
  });

  // Increment referral total commission
  // Fetch existing referral
  const { data: ref } = await supabase
    .from("referrals")
    .select("total_commission")
    .eq("referrer_id", referrer.id)
    .eq("referred_id", referredUserId)
    .single();

  if (ref) {
    const newTotal = Number(ref.total_commission || 0) + commissionAmount;
    await supabase
      .from("referrals")
      .update({ total_commission: newTotal })
      .eq("referrer_id", referrer.id)
      .eq("referred_id", referredUserId);
  }

  emitToUser(referrer.id, "affiliateEarningsUpdated", {
    affiliateEarnings: newEarnings,
    commissionAmount,
  });
}

export async function withdrawAffiliateEarnings(userId) {
  const { data: user } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (!user || Number(user.affiliate_earnings || 0) <= 0) {
    throw new AppError("No affiliate earnings to withdraw", 400);
  }

  const amount = Number(user.affiliate_earnings);

  // Reset earnings in DB
  const { error } = await supabase
    .from("profiles")
    .update({ affiliate_earnings: 0 })
    .eq("id", userId);

  if (error) throw new AppError("Failed to withdraw affiliate earnings", 500);

  await recordTransaction({
    userId,
    type: "affiliate_payout",
    amount,
    metadata: { source: "affiliate_withdrawal" },
  });

  return amount;
}

export async function getAffiliateDashboard(userId) {
  const { data: user, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !user) throw new AppError("User not found", 404);

  const code = await ensureReferralCode(user);

  // Query referrals and join referred profile details
  const { data: rawReferrals } = await supabase
    .from("referrals")
    .select("*, referred:referred_id(username, display_name, stats, created_at)")
    .eq("referrer_id", userId)
    .order("created_at", { ascending: false });

  const referrals = (rawReferrals || []).map((r) => ({
    _id: r.id,
    referrerId: r.referrer_id,
    referredId: {
      _id: r.referred_id,
      username: r.referred?.username,
      displayName: r.referred?.display_name || r.referred?.username,
      createdAt: r.referred?.created_at,
      stats: {
        totalWagered: Number(r.referred?.stats?.totalWagered ?? 0),
      },
    },
    commissionRate: Number(r.commission_rate),
    totalCommission: Number(r.total_commission),
    status: r.status,
    createdAt: r.created_at,
  }));

  // Query recent commissions
  const { data: rawCommissions } = await supabase
    .from("affiliate_commissions")
    .select("*")
    .eq("referrer_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  const commissions = (rawCommissions || []).map((c) => ({
    _id: c.id,
    referrerId: c.referrer_id,
    referredId: c.referred_id,
    gameHistoryId: c.game_history_id,
    lossAmount: Number(c.loss_amount),
    commissionRate: Number(c.commission_rate),
    commissionAmount: Number(c.commission_amount),
    createdAt: c.created_at,
  }));

  return {
    referralCode: code,
    affiliateEarnings: Number(user.affiliate_earnings ?? 0),
    commissionRate: Number(user.affiliate_commission_rate ?? 0.05),
    referrals,
    commissions,
    totalReferrals: referrals.length,
  };
}
