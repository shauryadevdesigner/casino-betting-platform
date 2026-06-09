import { supabase } from "../lib/supabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../middleware/errorHandler.js";

async function logAdmin(adminId, action, affectedUserId, changes = {}) {
  await supabase.from("admin_logs").insert({
    admin_id: adminId,
    action,
    target_id: affectedUserId,
    metadata: changes,
  });
}

export const getDashboard = asyncHandler(async (req, res) => {
  // Get profiles count
  const { count: usersCount, error: usersErr } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true });

  // Get games count
  const { count: betsCount, error: betsErr } = await supabase
    .from("game_histories")
    .select("id", { count: "exact", head: true });

  // Get deposits sum
  const { data: deposits } = await supabase
    .from("transactions")
    .select("amount")
    .eq("type", "deposit");
  const totalDeposits = (deposits || []).reduce((sum, item) => sum + Number(item.amount), 0);

  // Get withdrawals sum
  const { data: withdrawals } = await supabase
    .from("transactions")
    .select("amount")
    .eq("type", "withdraw");
  const totalWithdrawals = (withdrawals || []).reduce((sum, item) => sum + Number(item.amount), 0);

  res.json({
    success: true,
    metrics: {
      totalUsers: usersCount || 0,
      totalBets: betsCount || 0,
      totalDeposits,
      totalWithdrawals,
    },
  });
});

export const listUsers = asyncHandler(async (req, res) => {
  // Query profiles joining wallets
  const { data: users, error } = await supabase
    .from("profiles")
    .select("id, username, email, vip_tier, admin_role, is_banned, created_at, stats, wallets(balance)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw new AppError("Failed to fetch users", 500);

  // Map to legacy format
  const mappedUsers = (users || []).map((u) => ({
    _id: u.id,
    id: u.id,
    username: u.username,
    email: u.email,
    balance: Number(u.wallets?.balance ?? 1000),
    vipTier: u.vip_tier,
    adminRole: u.admin_role,
    isBanned: u.is_banned,
    createdAt: u.created_at,
    stats: u.stats,
  }));

  res.json({ success: true, users: mappedUsers });
});

export const banUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  const { data: user, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (error || !user) throw new AppError("User not found", 404);

  // Update profile
  const { error: updateErr } = await supabase
    .from("profiles")
    .update({ is_banned: true, is_active: false })
    .eq("id", userId);

  if (updateErr) throw new AppError("Failed to ban user", 500);

  await logAdmin(req.user._id, "ban_user", userId, { isBanned: true });

  res.json({ success: true });
});

export const listLogs = asyncHandler(async (req, res) => {
  const { data: logs, error } = await supabase
    .from("admin_logs")
    .select("*, admin:admin_id(username)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw new AppError("Failed to fetch admin logs", 500);

  const mappedLogs = (logs || []).map((l) => ({
    _id: l.id,
    id: l.id,
    action: l.action,
    targetId: l.target_id,
    changes: l.metadata,
    createdAt: l.created_at,
    adminId: l.admin ? { username: l.admin.username } : null,
  }));

  res.json({ success: true, logs: mappedLogs });
});

export const listAffiliates = asyncHandler(async (req, res) => {
  const { data: referrals, error } = await supabase
    .from("referrals")
    .select("*, referrer:referrer_id(username, email, affiliate_earnings), referred:referred_id(username, email, affiliate_earnings)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw new AppError("Failed to fetch affiliates", 500);

  const mappedReferrals = (referrals || []).map((r) => ({
    _id: r.id,
    id: r.id,
    commissionRate: Number(r.commission_rate),
    totalCommission: Number(r.total_commission),
    status: r.status,
    createdAt: r.created_at,
    referrerId: r.referrer ? {
      username: r.referrer.username,
      email: r.referrer.email,
      affiliateEarnings: Number(r.referrer.affiliate_earnings ?? 0),
    } : null,
    referredId: r.referred ? {
      username: r.referred.username,
      email: r.referred.email,
      affiliateEarnings: Number(r.referred.affiliate_earnings ?? 0),
    } : null,
  }));

  res.json({ success: true, referrals: mappedReferrals });
});
