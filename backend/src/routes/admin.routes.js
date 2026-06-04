import { Router } from "express";
import {
  getDashboard,
  listUsers,
  banUser,
  listLogs,
  listAffiliates,
} from "../controllers/adminController.js";
import { protect } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";

const router = Router();
router.use(protect, requireAdmin);

router.get("/dashboard", getDashboard);
router.get("/users", listUsers);
router.post("/users/:id/ban", banUser);
router.get("/logs", listLogs);
router.get("/affiliates", listAffiliates);

export default router;
