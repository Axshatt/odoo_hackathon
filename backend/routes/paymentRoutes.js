import { Router } from "express";
import {
  handleRecordPayment,
  handleGetPayments,
  handleGetPaymentById,
} from "../controller/paymentController.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(verifyJWT);

router.post("/", handleRecordPayment);
router.get("/", handleGetPayments);
router.get("/:id", handleGetPaymentById);

export default router;

