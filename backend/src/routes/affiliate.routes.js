import { Router } from "express";
import { getDashboard, withdraw } from "../controllers/affiliateController.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.use(protect);
router.get("/dashboard", getDashboard);
router.post("/withdraw", withdraw);

export default router;
