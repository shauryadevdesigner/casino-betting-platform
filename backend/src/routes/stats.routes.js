import { Router } from "express";
import { getMyStats } from "../controllers/statsController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.use(protect);
router.get("/me", getMyStats);

export default router;
