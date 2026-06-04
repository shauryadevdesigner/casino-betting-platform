import mongoose from "mongoose";
import { User } from "../models/User.js";
import { Transaction } from "../models/Transaction.js";
import { AppError } from "../middleware/errorHandler.js";
import { emitToUser, emitLeaderboardUpdate } from "./socket.service.js";
import { EmailTemplates } from "./email.service.js";
import { convertAmount, getCurrencySymbol } from "./currency.service.js";

export async function getBalance(userId) {
  const user = await User.findById(userId).select("balance preferredCurrency");
  if (!user) throw new AppError("User not found", 404);
  const display = await convertAmount(user.balance, user.preferredCurrency);
  return {
    balance: user.balance,
    displayBalance: display,
    currency: user.preferredCurrency,
    symbol: getCurrencySymbol(user.preferredCurrency),
  };
}

export async function requestWithdraw(userId, amount) {
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);
  if (user.twoFactorEnabled) {
    throw new AppError("2FA verification required for withdrawals", 403);
  }
  const result = await recordTransaction({
    userId,
    type: "withdraw",
    amount,
    metadata: { status: "pending" },
  });
  emitToUser(userId.toString(), "withdrawalSubmitted", {
    amount,
    balance: result.balanceAfter,
  });
  return result;
}

export async function recordTransaction({
  userId,
  type,
  amount,
  game = null,
  referenceId = null,
  metadata = {},
  session = null,
}) {
  const run = async (s) => {
    const user = await User.findById(userId).session(s);
    if (!user) throw new AppError("User not found", 404);

    const balanceBefore = user.balance;
    let balanceAfter = balanceBefore;

    if (type === "deposit" || type === "win" || type === "daily_reward") {
      balanceAfter = balanceBefore + amount;
      user.balance = balanceAfter;
    } else if (type === "bet" || type === "withdraw") {
      if (balanceBefore < amount) throw new AppError("Insufficient balance", 400);
      balanceAfter = balanceBefore - amount;
      user.balance = balanceAfter;
    } else if (type === "adjustment") {
      balanceAfter = balanceBefore + amount;
      if (balanceAfter < 0) throw new AppError("Insufficient balance", 400);
      user.balance = balanceAfter;
    }

    await user.save({ session: s });

    const tx = await Transaction.create(
      [
        {
          userId,
          type,
          amount,
          balanceBefore,
          balanceAfter,
          game,
          referenceId,
          metadata,
        },
      ],
      { session: s },
    );

    const result = { user, transaction: tx[0], balanceAfter };

    emitToUser(userId.toString(), "balanceUpdated", {
      balance: balanceAfter,
      type,
      amount,
      game,
      transactionId: tx[0]._id,
    });

    if (type === "deposit") {
      EmailTemplates.depositConfirmation(user.email, {
        amount: `$${amount.toFixed(2)}`,
        name: user.displayName,
      });
    }
    if (type === "withdraw") {
      EmailTemplates.withdrawalNotification(user.email, {
        amount: `$${amount.toFixed(2)}`,
        name: user.displayName,
      });
    }

    emitLeaderboardUpdate({ trigger: "balance", userId });

    return result;
  };

  if (session) return run(session);

  const s = await mongoose.startSession();
  s.startTransaction();
  try {
    const result = await run(s);
    await s.commitTransaction();
    return result;
  } catch (e) {
    await s.abortTransaction();
    throw e;
  } finally {
    s.endSession();
  }
}

export async function deductBet(userId, amount, game, metadata = {}) {
  return recordTransaction({
    userId,
    type: "bet",
    amount,
    game,
    metadata,
  });
}

export async function creditWin(userId, amount, game, metadata = {}) {
  return recordTransaction({
    userId,
    type: "win",
    amount,
    game,
    metadata,
  });
}

export async function addDeposit(userId, amount) {
  return recordTransaction({
    userId,
    type: "deposit",
    amount,
    metadata: { source: "demo_deposit" },
  });
}

export async function getTransactionHistory(userId, { limit = 50, skip = 0 } = {}) {
  const [items, total] = await Promise.all([
    Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Transaction.countDocuments({ userId }),
  ]);
  return { items, total };
}
