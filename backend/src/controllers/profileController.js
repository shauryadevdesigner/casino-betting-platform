import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../middleware/errorHandler.js";

export const getProfile = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user.toPublicJSON() });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { displayName, avatarUrl, preferredCurrency } = req.body;

  if (preferredCurrency !== undefined) {
    const allowed = ["USD", "EUR", "GBP", "INR", "AUD", "CAD", "SGD", "HKD", "JPY"];
    if (!allowed.includes(preferredCurrency)) {
      throw new AppError("Invalid currency");
    }
    req.user.preferredCurrency = preferredCurrency;
  }

  if (displayName !== undefined) {
    if (!displayName.trim()) throw new AppError("Display name cannot be empty");
    req.user.displayName = displayName.trim();
  }
  if (avatarUrl !== undefined) {
    req.user.avatarUrl = avatarUrl;
  }

  await req.user.save();
  res.json({ success: true, user: req.user.toPublicJSON() });
});
