import { Router } from "express";
import authRoutes from "./auth.routes.js";
import walletRoutes from "./wallet.routes.js";
import profileRoutes from "./profile.routes.js";
import diceRoutes from "./dice.routes.js";
import coinflipRoutes from "./coinflip.routes.js";
import minesRoutes from "./mines.routes.js";
import leaderboardRoutes from "./leaderboard.routes.js";
import statsRoutes from "./stats.routes.js";
import dailyRewardRoutes from "./dailyReward.routes.js";
import affiliateRoutes from "./affiliate.routes.js";
import vipRoutes from "./vip.routes.js";
import adminRoutes from "./admin.routes.js";
import missionRoutes from "./mission.routes.js";
import tournamentRoutes from "./tournament.routes.js";
import supportRoutes from "./support.routes.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ success: true, message: "FastLuck API is running" });
});

router.use("/auth", authRoutes);
router.use("/wallet", walletRoutes);
router.use("/profile", profileRoutes);
router.use("/games/dice", diceRoutes);
router.use("/games/coinflip", coinflipRoutes);
router.use("/games/mines", minesRoutes);
router.use("/leaderboard", leaderboardRoutes);
router.use("/stats", statsRoutes);
router.use("/rewards/daily", dailyRewardRoutes);
router.use("/affiliate", affiliateRoutes);
router.use("/vip", vipRoutes);
router.use("/admin", adminRoutes);
router.use("/missions", missionRoutes);
router.use("/tournaments", tournamentRoutes);
router.use("/support", supportRoutes);

export default router;
