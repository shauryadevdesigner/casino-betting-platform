import { User } from "../models/User.js";
import { Transaction } from "../models/Transaction.js";
import { GameHistory } from "../models/GameHistory.js";
import { AdminLog } from "../models/AdminLog.js";
import { Referral } from "../models/Referral.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../middleware/errorHandler.js";

async function logAdmin(adminId, action, affectedUserId, changes = {}) {
  await AdminLog.create({ adminId, action, affectedUserId, changes });
}

export const getDashboard = asyncHandler(async (req, res) => {
  const [users, bets, deposits, withdrawals] = await Promise.all([
    User.countDocuments(),
    GameHistory.countDocuments(),
    Transaction.aggregate([
      { $match: { type: "deposit" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Transaction.aggregate([
      { $match: { type: "withdraw" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
  ]);

  res.json({
    success: true,
    metrics: {
      totalUsers: users,
      totalBets: bets,
      totalDeposits: deposits[0]?.total ?? 0,
      totalWithdrawals: withdrawals[0]?.total ?? 0,
    },
  });
});

export const listUsers = asyncHandler(async (req, res) => {
  const users = await User.find()
    .select("username email balance vipTier adminRole isBanned createdAt stats")
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();
  res.json({ success: true, users });
});

export const banUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError("User not found", 404);
  user.isBanned = true;
  user.isActive = false;
  await user.save();
  await logAdmin(req.user._id, "ban_user", user._id, { isBanned: true });
  res.json({ success: true });
});

export const listLogs = asyncHandler(async (req, res) => {
  const logs = await AdminLog.find()
    .populate("adminId", "username")
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();
  res.json({ success: true, logs });
});

export const listAffiliates = asyncHandler(async (req, res) => {
  const referrals = await Referral.find()
    .populate("referrerId referredId", "username email affiliateEarnings")
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();
  res.json({ success: true, referrals });
});
