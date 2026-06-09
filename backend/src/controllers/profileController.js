import { supabase } from "../lib/supabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../middleware/errorHandler.js";
import { userToPublicJSON } from "../utils/userMapper.js";

export const getProfile = asyncHandler(async (req, res) => {
  res.json({ success: true, user: userToPublicJSON(req.user) });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { displayName, avatarUrl, preferredCurrency } = req.body;
  const updateData = {};

  if (preferredCurrency !== undefined) {
    const allowed = ["USD", "EUR", "GBP", "INR", "AUD", "CAD", "SGD", "HKD", "JPY"];
    if (!allowed.includes(preferredCurrency)) {
      throw new AppError("Invalid currency", 400);
    }
    updateData.preferred_currency = preferredCurrency;
  }

  if (displayName !== undefined) {
    if (!displayName.trim()) throw new AppError("Display name cannot be empty", 400);
    updateData.display_name = displayName.trim();
  }
  if (avatarUrl !== undefined) {
    updateData.avatar_url = avatarUrl;
  }

  const { data: updated, error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", req.user._id)
    .select("*, wallets(balance)")
    .single();

  if (error) throw new AppError("Failed to update profile", 500);

  res.json({ success: true, user: userToPublicJSON(updated) });
});
