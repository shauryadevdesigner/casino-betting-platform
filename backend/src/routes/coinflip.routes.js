import { Router } from "express";
import { playCoinFlip } from "../controllers/coinflipController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.use(protect);
router.post("/play", playCoinFlip);

export default router;
