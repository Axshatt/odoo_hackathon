import { Router } from "express";
import authRoutes from "./authRoutes.js";
import productRoutes from "./productRoutes.js";
import planRoutes from "./planRoutes.js";
import quoteRoutes from "./quoteRoutes.js";
import subscriptionRoutes from "./subscriptionRoutes.js";
import billingRoutes from "./billingRoutes.js";
import paymentRoutes from "./paymentRoutes.js";
import analyticsRoutes from "./analyticsRoutes.js";
import aiRoutes from "./aiRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/plans", planRoutes);
router.use("/quotes", quoteRoutes);
router.use("/subscriptions", subscriptionRoutes);
router.use("/billing", billingRoutes);
router.use("/payments", paymentRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/ai", aiRoutes);

export default router;

