import { supabase } from "../lib/supabase.js";
import { AppError } from "../middleware/errorHandler.js";
import { emitToUser, emitLeaderboardUpdate } from "./socket.service.js";
import { EmailTemplates } from "./email.service.js";
import { convertAmount, getCurrencySymbol } from "./currency.service.js";
import { userToPublicJSON } from "../utils/userMapper.js";

export async function getBalance(userId) {
  const { data: wallet, error } = await supabase
    .from("wallets")
    .select("balance, profiles(preferred_currency)")
    .eq("user_id", userId)
    .single();

  if (error || !wallet) throw new AppError("Wallet or user not found", 404);

  const preferredCurrency = wallet.profiles?.preferred_currency || "USD";
  const display = await convertAmount(wallet.balance, preferredCurrency);

  return {
    balance: Number(wallet.balance),
    displayBalance: display,
    currency: preferredCurrency,
    symbol: getCurrencySymbol(preferredCurrency),
  };
}

export async function requestWithdraw(userId, amount) {
  // Check if 2FA is enabled
  const { data: user, error: userErr } = await supabase
    .from("profiles")
    .select("two_factor_enabled")
    .eq("id", userId)
    .single();

  if (userErr || !user) throw new AppError("User not found", 404);
  if (user.two_factor_enabled) {
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
}) {
  // Call the atomic PL/pgSQL database function in Supabase
  const { data, error } = await supabase.rpc("record_transaction_rpc", {
    p_user_id: userId,
    p_type: type,
    p_amount: amount,
    p_game: game,
    p_reference_id: referenceId,
    p_metadata: metadata,
  });

  if (error) {
    if (error.message.includes("Insufficient balance")) {
      throw new AppError("Insufficient balance", 400);
    }
    throw new AppError(error.message, 500);
  }

  const balanceAfter = Number(data.balanceAfter);
  const transactionId = data.transactionId;

  // Retrieve updated profile for WebSocket/Email templates compatibility
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  emitToUser(userId.toString(), "balanceUpdated", {
    balance: balanceAfter,
    type,
    amount,
    game,
    transactionId,
  });

  if (profile) {
    if (type === "deposit") {
      EmailTemplates.depositConfirmation(profile.email, {
        amount: `$${amount.toFixed(2)}`,
        name: profile.display_name || profile.username,
      });
    }
    if (type === "withdraw") {
      EmailTemplates.withdrawalNotification(profile.email, {
        amount: `$${amount.toFixed(2)}`,
        name: profile.display_name || profile.username,
      });
    }
  }

  emitLeaderboardUpdate({ trigger: "balance", userId });

  // Return formatted results matching previous Mongoose returns
  return {
    user: profile ? { ...profile, balance: balanceAfter } : null,
    transaction: {
      id: transactionId,
      userId,
      type,
      amount,
      balanceBefore: data.balanceBefore,
      balanceAfter,
      game,
      referenceId,
      metadata,
    },
    balanceAfter,
  };
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
  // Query Supabase transactions
  const { data, count, error } = await supabase
    .from("transactions")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(skip, skip + limit - 1);

  if (error) throw new AppError(error.message, 500);

  // Map to legacy Mongoose fields (like _id, createdAt)
  const items = (data || []).map((t) => ({
    _id: t.id,
    type: t.type,
    amount: Number(t.amount),
    balanceBefore: Number(t.balance_before),
    balanceAfter: Number(t.balance_after),
    game: t.game,
    createdAt: t.created_at,
  }));

  return { items, total: count || 0 };
}
