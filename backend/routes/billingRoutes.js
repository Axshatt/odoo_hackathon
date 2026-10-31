import { Router } from "express";
import {
  handleGenerateInvoice,
  handleConfirmInvoice,
  handleCancelInvoice,
  handleGetInvoices,
  handleGetInvoiceById,
  handleRecurringBillingBatch,
  handleGetTaxRules,
  handleUpdateTaxRate,
  handleGetDiscountRules,
  handleCreateDiscountRule,
} from "../controller/billingController.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = Router();

router.use(verifyJWT);

router.get("/invoices", handleGetInvoices);
router.get("/invoices/:id", handleGetInvoiceById);
router.post("/invoices/generate", authorizeRoles("Admin", "Staff"), handleGenerateInvoice);
router.patch("/invoices/:id/confirm", authorizeRoles("Admin", "Staff"), handleConfirmInvoice);
router.patch("/invoices/:id/cancel", authorizeRoles("Admin", "Staff"), handleCancelInvoice);
router.post("/recurring-batch", authorizeRoles("Admin", "Staff"), handleRecurringBillingBatch);

router.get("/taxes", handleGetTaxRules);
router.post("/taxes", authorizeRoles("Admin"), handleUpdateTaxRate);

router.get("/discounts", handleGetDiscountRules);
router.post("/discounts", authorizeRoles("Admin"), handleCreateDiscountRule);

export default router;

