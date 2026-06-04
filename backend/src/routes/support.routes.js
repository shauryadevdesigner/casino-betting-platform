import { Router } from "express";
import { getOrCreateChat, rateChat } from "../controllers/supportController.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.use(protect);
router.get("/chat", getOrCreateChat);
router.post("/chat/:id/rate", rateChat);

export default router;
