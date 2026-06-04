import { Router } from "express";
import {
  register,
  login,
  getMe,
  googleLogin,
  setup2FA,
  verify2FA,
  disable2FA,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);
router.get("/me", protect, getMe);
router.post("/2fa/setup", protect, setup2FA);
router.post("/2fa/verify", protect, verify2FA);
router.post("/2fa/disable", protect, disable2FA);

export default router;
