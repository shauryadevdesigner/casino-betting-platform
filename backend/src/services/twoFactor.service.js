import speakeasy from "speakeasy";
import QRCode from "qrcode";
import crypto from "crypto";
import { User } from "../models/User.js";
import { encrypt, decrypt } from "../utils/crypto.js";
import { AppError } from "../middleware/errorHandler.js";

export async function setupTwoFactor(userId) {
  const user = await User.findById(userId).select("+twoFactorSecret +backupCodes");
  if (!user) throw new AppError("User not found", 404);

  const secret = speakeasy.generateSecret({
    name: `FastLuck (${user.email})`,
    length: 20,
  });

  user.twoFactorSecret = encrypt(secret.base32);
  user.twoFactorEnabled = false;
  user.backupCodes = Array.from({ length: 10 }, () =>
    crypto.randomBytes(4).toString("hex").toUpperCase(),
  ).map((c) => encrypt(c));
  await user.save();

  const qrDataUrl = await QRCode.toDataURL(secret.otpauth_url);
  return {
    qrDataUrl,
    secret: secret.base32,
    backupCodes: user.backupCodes.map((c) => decrypt(c)),
  };
}

export function verifyTotp(user, token) {
  if (!user.twoFactorSecret) return false;
  const secret = decrypt(user.twoFactorSecret);
  return speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    window: 1,
  });
}

export function verifyBackupCode(user, code) {
  const normalized = code.trim().toUpperCase();
  const idx = user.backupCodes?.findIndex((c) => decrypt(c) === normalized);
  if (idx === -1 || idx === undefined) return false;
  user.backupCodes.splice(idx, 1);
  return true;
}

export async function enableTwoFactor(userId, token) {
  const user = await User.findById(userId).select("+twoFactorSecret +backupCodes");
  if (!verifyTotp(user, token)) throw new AppError("Invalid verification code", 400);
  user.twoFactorEnabled = true;
  await user.save();
  return { enabled: true };
}

export async function disableTwoFactor(userId, token) {
  const user = await User.findById(userId).select("+twoFactorSecret +backupCodes");
  if (!verifyTotp(user, token) && !verifyBackupCode(user, token)) {
    throw new AppError("Invalid verification code", 400);
  }
  user.twoFactorEnabled = false;
  user.twoFactorSecret = null;
  user.backupCodes = [];
  await user.save();
}
