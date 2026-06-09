import bcrypt from "bcryptjs";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import { supabase } from "../lib/supabase.js";
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
import { userToPublicJSON } from "../utils/userMapper.js";

const googleClient = env.googleClientId
  ? new OAuth2Client(env.googleClientId)
  : null;

// Helper to generate a stable password for OAuth users to allow signInWithPassword
function getStableOAuthPassword(oauthSub) {
  return crypto.createHmac("sha256", env.jwtSecret).update(oauthSub).digest("hex");
}

export const register = asyncHandler(async (req, res) => {
  const { username, email, password, displayName, referralCode } = req.body;

  if (!username || !email || !password) {
    throw new AppError("Username, email, and password are required", 400);
  }
  if (password.length < 6) {
    throw new AppError("Password must be at least 6 characters", 400);
  }

  // Check unique username in public.profiles
  const { data: nameCheck } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (nameCheck) throw new AppError("Username already in use", 409);

  // Sign up via Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email: email.toLowerCase(),
    password,
    options: {
      data: {
        username,
        displayName: displayName || username,
      },
    },
  });

  if (error) throw new AppError(error.message, 400);
  if (!data.user) throw new AppError("Signup failed", 500);

  const userId = data.user.id;

  // Retrieve profile (trigger on_auth_user_created handles creation)
  let { data: profile } = await supabase
    .from("profiles")
    .select("*, wallets(balance)")
    .eq("id", userId)
    .maybeSingle();

  // Fallback in case trigger is slightly asynchronous in local setup
  if (!profile) {
    // Manually create profile and wallet
    const { data: newProf } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        username,
        email: email.toLowerCase(),
        display_name: displayName || username,
        vip_tier: "bronze",
      })
      .select()
      .single();

    await supabase.from("wallets").insert({ user_id: userId, balance: 1000.00 });

    const { data: profWithWallet } = await supabase
      .from("profiles")
      .select("*, wallets(balance)")
      .eq("id", userId)
      .single();
    profile = profWithWallet;
  }

  await ensureReferralCode(profile);
  await applyReferralCode(profile, referralCode);

  // Reload profile to get latest referral details
  const { data: latestProfile } = await supabase
    .from("profiles")
    .select("*, wallets(balance)")
    .eq("id", userId)
    .single();

  res.status(201).json({
    success: true,
    token: data.session?.access_token || "",
    user: userToPublicJSON(latestProfile),
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password, otp } = req.body;
  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  // Authenticate using Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.toLowerCase(),
    password,
  });

  if (error) throw new AppError("Invalid credentials", 401);

  // Get user profile
  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("*, wallets(balance)")
    .eq("id", data.user.id)
    .single();

  if (profileErr || !profile) throw new AppError("User profile not found", 404);

  // Handle 2FA verification
  if (profile.two_factor_enabled) {
    if (!otp) {
      // Return 2FA required status to frontend
      return res.json({
        success: true,
        requires2FA: true,
        userId: profile.id,
      });
    }
    const isBackupUsed = verifyBackupCode(profile, otp);
    if (!verifyTotp(profile, otp) && !isBackupUsed) {
      throw new AppError("Invalid 2FA code", 401);
    }
    // Update backup codes in DB if backup code was used
    if (isBackupUsed) {
      await supabase
        .from("profiles")
        .update({ backup_codes: profile.backup_codes })
        .eq("id", profile.id);
    }
  }

  res.json({
    success: true,
    token: data.session.access_token,
    user: userToPublicJSON(profile),
  });
});

export const googleLogin = asyncHandler(async (req, res) => {
  const { idToken, referralCode } = req.body;
  if (!idToken) throw new AppError("Google ID token required", 400);
  if (!googleClient) throw new AppError("Google OAuth not configured", 503);

  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: env.googleClientId,
  });
  const payload = ticket.getPayload();
  if (!payload?.email) throw new AppError("Invalid Google token", 401);

  // Find profile by googleId or email
  let { data: profile } = await supabase
    .from("profiles")
    .select("*, wallets(balance)")
    .or(`google_id.eq.${payload.sub},email.eq.${payload.email.toLowerCase()}`)
    .maybeSingle();

  const stablePassword = getStableOAuthPassword(payload.sub);

  if (!profile) {
    const baseUsername = (payload.email.split("@")[0] || "player")
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 12);
    let username = baseUsername;
    let n = 1;
    while (true) {
      const { data: exists } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .maybeSingle();
      if (!exists) break;
      username = `${baseUsername}${n++}`;
    }

    // Create user in Supabase Auth
    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email: payload.email.toLowerCase(),
      password: stablePassword,
      email_confirm: true,
      user_metadata: {
        username,
        displayName: payload.name || username,
        avatarUrl: payload.picture || "",
      },
    });

    if (authErr) throw new AppError(authErr.message, 500);

    // Update profile
    const { data: newProfile } = await supabase
      .from("profiles")
      .update({
        google_id: payload.sub,
        profile_picture_url: payload.picture || "",
        avatar_url: payload.picture || "",
      })
      .eq("id", authData.user.id)
      .select("*, wallets(balance)")
      .single();

    profile = newProfile;
    await ensureReferralCode(profile);
    await applyReferralCode(profile, referralCode);

    // Reload
    const { data: latestProfile } = await supabase
      .from("profiles")
      .select("*, wallets(balance)")
      .eq("id", authData.user.id)
      .single();
    profile = latestProfile;
  } else if (!profile.google_id) {
    // Link existing user
    const { data: updatedProfile } = await supabase
      .from("profiles")
      .update({
        google_id: payload.sub,
        profile_picture_url: payload.picture || profile.profile_picture_url,
        avatar_url: payload.picture || profile.avatar_url,
      })
      .eq("id", profile.id)
      .select("*, wallets(balance)")
      .single();
    profile = updatedProfile;
  }

  // Sign in using stable credentials to generate a valid access token
  const { data: signinData, error: signinErr } = await supabase.auth.signInWithPassword({
    email: profile.email,
    password: stablePassword,
  });

  if (signinErr) throw new AppError("Google auth login failed", 500);

  res.json({
    success: true,
    token: signinData.session.access_token,
    user: userToPublicJSON(profile),
  });
});

export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: userToPublicJSON(req.user) });
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

export const postSignup = asyncHandler(async (req, res) => {
  const { referralCode } = req.body;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", req.user._id)
    .single();

  if (error || !profile) throw new AppError("User profile not found", 404);

  // Apply referral and ensure referral code
  await ensureReferralCode(profile);
  if (referralCode) {
    await applyReferralCode(profile, referralCode);
  }

  res.json({ success: true });
});

export const check2FA = asyncHandler(async (req, res) => {
  const { otp } = req.body;
  if (!otp) throw new AppError("2FA code required", 400);

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", req.user._id)
    .single();

  if (error || !profile) throw new AppError("User profile not found", 404);

  const isBackupUsed = verifyBackupCode(profile, otp);
  const totpOk = verifyTotp(profile, otp);

  if (!totpOk && !isBackupUsed) {
    throw new AppError("Invalid 2FA code", 401);
  }

  if (isBackupUsed) {
    await supabase
      .from("profiles")
      .update({ backup_codes: profile.backup_codes })
      .eq("id", profile.id);
  }

  res.json({ success: true });
});
