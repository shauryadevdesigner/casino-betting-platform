import { Router } from "express";
import { getProfile, updateProfile } from "../controllers/profileController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.use(protect);
router.get("/", getProfile);
router.patch("/", updateProfile);

export default router;
