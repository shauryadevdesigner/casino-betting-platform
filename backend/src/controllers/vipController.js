import { getAllTiers, getNextTier, resolveTierForWagered } from "../services/vip.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listTiers = asyncHandler(async (req, res) => {
  const tiers = await getAllTiers();
  const current = await resolveTierForWagered(req.user.stats.totalWagered);
  const next = getNextTier(req.user.vipTier, tiers);
  res.json({
    success: true,
    currentTier: req.user.vipTier,
    totalWagered: req.user.stats.totalWagered,
    tiers,
    current,
    next,
    progressToNext: next
      ? Math.min(100, (req.user.stats.totalWagered / next.minWagered) * 100)
      : 100,
  });
});
