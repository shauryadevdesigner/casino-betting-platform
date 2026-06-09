import { supabase } from "../lib/supabase.js";
import { AppError } from "./errorHandler.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new AppError("Not authorized", 401);
  }

  const token = header.split(" ")[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw new AppError("Invalid or expired token", 401);
  }

  // Fetch profile and joined wallet balance
  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("*, wallets(balance)")
    .eq("id", user.id)
    .single();

  if (profileErr || !profile) {
    throw new AppError("User profile not found", 401);
  }

  if (!profile.is_active || profile.is_banned) {
    throw new AppError("User is inactive or banned", 401);
  }

  // Attach formatted user object to request
  req.user = {
    ...profile,
    _id: profile.id, // For compatibility with legacy code using _id
    balance: Number(profile.wallets?.balance ?? 1000),
  };

  next();
});
