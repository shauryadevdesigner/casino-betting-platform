import { Router } from "express";
import { listMissions, claimMission } from "../controllers/missionController.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.use(protect);
router.get("/", listMissions);
router.post("/:id/claim", claimMission);

export default router;
