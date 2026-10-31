import { Router } from "express";
import {
  handleCreateSubscription,
  handleGetSubscriptions,
  handleGetSubscriptionById,
  handleUpdateStatus,
} from "../controller/subscriptionController.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(verifyJWT);

router.get("/", handleGetSubscriptions);
router.get("/:id", handleGetSubscriptionById);
router.post("/", handleCreateSubscription);
router.patch("/:id/status", handleUpdateStatus);

export default router;

