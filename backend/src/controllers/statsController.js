import { statsToResponse } from "../services/statsService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getMyStats = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    stats: statsToResponse(req.user.stats),
  });
});
