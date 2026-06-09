import {
  getBalance,
  addDeposit,
  getTransactionHistory,
  requestWithdraw,
} from "../services/walletService.js";
import { supabase } from "../lib/supabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../middleware/errorHandler.js";

export const getWalletBalance = asyncHandler(async (req, res) => {
  const data = await getBalance(req.user._id);
  res.json({ success: true, ...data });
});

export const withdrawFunds = asyncHandler(async (req, res) => {
  const amount = Number(req.body.amount);
  const otp = req.body.otp;
  if (!amount || amount <= 0) throw new AppError("Valid withdrawal amount required", 400);

  const twoFactorEnabled = req.user.two_factor_enabled || req.user.twoFactorEnabled;

  if (twoFactorEnabled) {
    const { verifyTotp, verifyBackupCode } = await import("../services/twoFactor.service.js");
    
    const { data: user, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", req.user._id)
      .single();

    if (error || !user) throw new AppError("User not found", 404);

    const backupUsed = otp && verifyBackupCode(user, otp);
    const totpOk = otp && verifyTotp(user, otp);
    if (!otp || (!totpOk && !backupUsed)) {
      throw new AppError("Valid 2FA code required for withdrawals", 403);
    }
    if (backupUsed) {
      await supabase
        .from("profiles")
        .update({ backup_codes: user.backup_codes })
        .eq("id", user.id);
    }
  }

  // Force bypass the withdrawal check inside requestWithdraw since we've already done it here
  const result = await requestWithdraw(req.user._id, amount);
  res.json({ success: true, balance: result.balanceAfter });
});

export const depositFunds = asyncHandler(async (req, res) => {
  const amount = Number(req.body.amount);
  if (!amount || amount <= 0) throw new AppError("Valid deposit amount required", 400);

  const { balanceAfter, transaction } = await addDeposit(req.user._id, amount);
  res.json({
    success: true,
    balance: balanceAfter,
    transaction,
  });
});

export const listTransactions = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const skip = Number(req.query.skip) || 0;
  const history = await getTransactionHistory(req.user._id, { limit, skip });
  res.json({ success: true, ...history });
});
