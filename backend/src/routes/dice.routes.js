import { Router } from "express";
import { playDice } from "../controllers/diceController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.use(protect);
router.post("/play", playDice);

export default router;
