import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  getAllDisputes,
  getDisputeById,
  resolveDispute,
  rejectDispute,
} from "../controllers/adminDisputeController.js";

const router = express.Router();

router.use(protect, admin); // all routes below require admin access

router.get("/", getAllDisputes);
router.get("/:id", getDisputeById);
router.put("/:id/resolve", resolveDispute);
router.put("/:id/reject", rejectDispute);

export default router;
