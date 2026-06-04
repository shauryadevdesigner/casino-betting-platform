import { Router } from "express";
import {
  getWalletBalance,
  depositFunds,
  listTransactions,
  withdrawFunds,
} from "../controllers/walletController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.use(protect);
router.get("/balance", getWalletBalance);
router.post("/deposit", depositFunds);
router.post("/withdraw", withdrawFunds);
router.get("/transactions", listTransactions);

export default router;
