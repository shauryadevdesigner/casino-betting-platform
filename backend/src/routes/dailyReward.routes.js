import { Router } from "express";
import {
  getDailyStatus,
  claimDailyReward,
} from "../controllers/dailyRewardController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.use(protect);
router.get("/status", getDailyStatus);
router.post("/claim", claimDailyReward);

export default router;
