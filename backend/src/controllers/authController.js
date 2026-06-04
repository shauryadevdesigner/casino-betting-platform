import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import { User } from "../models/User.js";
import { signToken } from "../utils/jwt.js";
import { env } from "../config/env.js";
import { AppError } from "../middleware/errorHandler.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { applyReferralCode, ensureReferralCode } from "../services/affiliate.service.js";
import {
  setupTwoFactor,
  enableTwoFactor,
  disableTwoFactor,
  verifyTotp,
  verifyBackupCode,
} from "../services/twoFactor.service.js";

const googleClient = env.googleClientId
  ? new OAuth2Client(env.googleClientId)
  : null;

export const register = asyncHandler(async (req, res) => {
  const { username, email, password, displayName, referralCode } = req.body;

  if (!username || !email || !password) {
    throw new AppError("Username, email, and password are required");
  }
  if (password.length < 6) {
    throw new AppError("Password must be at least 6 characters");
  }

  const exists = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { username }],
  });
  if (exists) throw new AppError("Username or email already in use", 409);

  const hashed = await bcrypt.hash(password, 12);
  const user = await User.create({
    username,
    email: email.toLowerCase(),
    password: hashed,
    displayName: displayName || username,
    balance: env.initialBalance,
    emailVerified: false,
  });

  await ensureReferralCode(user);
  await applyReferralCode(user, referralCode);

  const token = signToken(user._id);
  res.status(201).json({
    success: true,
    token,
    user: user.toPublicJSON(),
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password, otp } = req.body;
  if (!email || !password) {
    throw new AppError("Email and password are required");
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password +twoFactorSecret +backupCodes",
  );
  if (!user || !user.password) throw new AppError("Invalid credentials", 401);

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new AppError("Invalid credentials", 401);

  if (user.twoFactorEnabled) {
    if (!otp) {
      return res.json({
        success: true,
        requires2FA: true,
        userId: user._id,
      });
    }
    if (!verifyTotp(user, otp) && !verifyBackupCode(user, otp)) {
      throw new AppError("Invalid 2FA code", 401);
    }
    await user.save();
  }

  const token = signToken(user._id);
  res.json({
    success: true,
    token,
    user: user.toPublicJSON(),
  });
});

export const googleLogin = asyncHandler(async (req, res) => {
  const { idToken, referralCode } = req.body;
  if (!idToken) throw new AppError("Google ID token required");
  if (!googleClient) throw new AppError("Google OAuth not configured", 503);

  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: env.googleClientId,
  });
  const payload = ticket.getPayload();
  if (!payload?.email) throw new AppError("Invalid Google token", 401);

  let user = await User.findOne({
    $or: [{ googleId: payload.sub }, { email: payload.email.toLowerCase() }],
  });

  if (!user) {
    const baseUsername = (payload.email.split("@")[0] || "player")
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 12);
    let username = baseUsername;
    let n = 1;
    while (await User.exists({ username })) {
      username = `${baseUsername}${n++}`;
    }

    user = await User.create({
      username,
      email: payload.email.toLowerCase(),
      googleId: payload.sub,
      profilePictureUrl: payload.picture || "",
      avatarUrl: payload.picture || "",
      displayName: payload.name || username,
      emailVerified: payload.email_verified ?? true,
      balance: env.initialBalance,
    });
    await ensureReferralCode(user);
    await applyReferralCode(user, referralCode);
  } else if (!user.googleId) {
    user.googleId = payload.sub;
    user.profilePictureUrl = payload.picture || user.profilePictureUrl;
    await user.save();
  }

  const token = signToken(user._id);
  res.json({
    success: true,
    token,
    user: user.toPublicJSON(),
  });
});

export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user.toPublicJSON() });
});

export const setup2FA = asyncHandler(async (req, res) => {
  const data = await setupTwoFactor(req.user._id);
  res.json({ success: true, ...data });
});

export const verify2FA = asyncHandler(async (req, res) => {
  await enableTwoFactor(req.user._id, req.body.token);
  res.json({ success: true, twoFactorEnabled: true });
});

export const disable2FA = asyncHandler(async (req, res) => {
  await disableTwoFactor(req.user._id, req.body.token);
  res.json({ success: true, twoFactorEnabled: false });
});
