import { Router } from "express";
import { listTiers } from "../controllers/vipController.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.get("/tiers", protect, listTiers);

export default router;
