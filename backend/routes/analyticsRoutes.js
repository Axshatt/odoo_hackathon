import { Router } from "express";
import {
  handleGetOverview,
  handleGetOverdue,
} from "../controller/analyticsController.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(verifyJWT);

router.get("/overview", handleGetOverview);
router.get("/overdue", handleGetOverdue);

export default router;

