import { Router } from "express";
import {
  startMines,
  revealTile,
  cashoutMines,
} from "../controllers/minesController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.use(protect);
router.post("/start", startMines);
router.post("/:gameId/reveal", revealTile);
router.post("/:gameId/cashout", cashoutMines);

export default router;
