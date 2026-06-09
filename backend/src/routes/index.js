import { Router } from "express";
import { requireDB } from "../middleware/dbReady.js";
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

// Health endpoint – always available, also reports DB status
router.get("/health", async (_req, res) => {
  res.json({
    success: true,
    message: "FastLuck API is running",
    database: "connected",
  });
});

// All DB-dependent routes get requireDB middleware
router.use("/auth", requireDB, authRoutes);
router.use("/wallet", requireDB, walletRoutes);
router.use("/profile", requireDB, profileRoutes);
router.use("/games/dice", requireDB, diceRoutes);
router.use("/games/coinflip", requireDB, coinflipRoutes);
router.use("/games/mines", requireDB, minesRoutes);
router.use("/leaderboard", requireDB, leaderboardRoutes);
router.use("/stats", requireDB, statsRoutes);
router.use("/rewards/daily", requireDB, dailyRewardRoutes);
router.use("/affiliate", requireDB, affiliateRoutes);
router.use("/vip", requireDB, vipRoutes);
router.use("/admin", requireDB, adminRoutes);
router.use("/missions", requireDB, missionRoutes);
router.use("/tournaments", requireDB, tournamentRoutes);
router.use("/support", requireDB, supportRoutes);

export default router;
