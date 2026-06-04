import { Router } from "express";
import {
  getActiveTournament,
  joinTournament,
} from "../controllers/tournamentController.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.get("/active", protect, getActiveTournament);
router.post("/:id/join", protect, joinTournament);

export default router;
