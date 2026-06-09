import { Router } from "express";
import { listTiers, buyVipTier } from "../controllers/vipController.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.get("/tiers", protect, listTiers);
router.post("/buy", protect, buyVipTier);

export default router;
