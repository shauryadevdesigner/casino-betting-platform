import speakeasy from "speakeasy";
import QRCode from "qrcode";
import crypto from "crypto";
import { supabase } from "../lib/supabase.js";
import { encrypt, decrypt } from "../utils/crypto.js";
import { AppError } from "../middleware/errorHandler.js";

export async function setupTwoFactor(userId) {
  const { data: user, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !user) throw new AppError("User not found", 404);

  const secret = speakeasy.generateSecret({
    name: `FastLuck (${user.email})`,
    length: 20,
  });

  const encryptedSecret = encrypt(secret.base32);
  const backupCodes = Array.from({ length: 10 }, () =>
    crypto.randomBytes(4).toString("hex").toUpperCase(),
  );
  const encryptedBackupCodes = backupCodes.map((c) => encrypt(c));

  const { error: updateErr } = await supabase
    .from("profiles")
    .update({
      two_factor_secret: encryptedSecret,
      two_factor_enabled: false,
      backup_codes: encryptedBackupCodes,
    })
    .eq("id", userId);

  if (updateErr) throw new AppError("Failed to setup 2FA", 500);

  const qrDataUrl = await QRCode.toDataURL(secret.otpauth_url);
  return {
    qrDataUrl,
    secret: secret.base32,
    backupCodes,
  };
}

export function verifyTotp(user, token) {
  if (!user.two_factor_secret) return false;
  const secret = decrypt(user.two_factor_secret);
  return speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    window: 1,
  });
}

export function verifyBackupCode(user, code) {
  const normalized = code.trim().toUpperCase();
  const codes = user.backup_codes || [];
  const idx = codes.findIndex((c) => decrypt(c) === normalized);
  if (idx === -1) return false;
  codes.splice(idx, 1);
  return true;
}

export async function enableTwoFactor(userId, token) {
  const { data: user, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !user) throw new AppError("User not found", 404);

  if (!verifyTotp(user, token)) throw new AppError("Invalid verification code", 400);

  const { error: updateErr } = await supabase
    .from("profiles")
    .update({ two_factor_enabled: true })
    .eq("id", userId);

  if (updateErr) throw new AppError("Failed to enable 2FA", 500);

  return { enabled: true };
}

export async function disableTwoFactor(userId, token) {
  const { data: user, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !user) throw new AppError("User not found", 404);

  const isBackupUsed = verifyBackupCode(user, token);
  if (!verifyTotp(user, token) && !isBackupUsed) {
    throw new AppError("Invalid verification code", 400);
  }

  const { error: updateErr } = await supabase
    .from("profiles")
    .update({
      two_factor_enabled: false,
      two_factor_secret: null,
      backup_codes: isBackupUsed ? user.backup_codes : [],
    })
    .eq("id", userId);

  if (updateErr) throw new AppError("Failed to disable 2FA", 500);
}
