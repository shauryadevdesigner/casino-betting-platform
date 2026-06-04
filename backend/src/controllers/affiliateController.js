import {
  getAffiliateDashboard,
  withdrawAffiliateEarnings,
} from "../services/affiliate.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getDashboard = asyncHandler(async (req, res) => {
  const data = await getAffiliateDashboard(req.user._id);
  res.json({ success: true, ...data });
});

export const withdraw = asyncHandler(async (req, res) => {
  const amount = await withdrawAffiliateEarnings(req.user._id);
  res.json({ success: true, amount });
});
