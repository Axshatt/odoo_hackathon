import { asyncHandler } from "../utils/Constructors/asyncHandler.js";
import { ApiResponse } from "../utils/Constructors/ApiResponse.js";
import * as billingService from "../services/billingService.js";

export const handleGenerateInvoice = asyncHandler(async (req, res) => {
  const { subscriptionId } = req.body;
  const invoice = await billingService.generateInvoiceForSubscription(
    subscriptionId,
    req.user
  );
  return res
    .status(201)
    .json(new ApiResponse(201, invoice, "Invoice generated successfully"));
});

export const handleConfirmInvoice = asyncHandler(async (req, res) => {
  const invoice = await billingService.confirmInvoice(req.params.id, req.user);
  return res
    .status(200)
    .json(new ApiResponse(200, invoice, "Invoice confirmed successfully"));
});

export const handleCancelInvoice = asyncHandler(async (req, res) => {
  const invoice = await billingService.cancelInvoice(req.params.id, req.user);
  return res
    .status(200)
    .json(new ApiResponse(200, invoice, "Invoice cancelled successfully"));
});

export const handleGetInvoices = asyncHandler(async (req, res) => {
  const invoices = await billingService.getInvoices(req.query, req.user);
  return res
    .status(200)
    .json(new ApiResponse(200, invoices, "Invoices fetched successfully"));
});

export const handleGetInvoiceById = asyncHandler(async (req, res) => {
  const invoice = await billingService.getInvoiceById(req.params.id, req.user);
  return res
    .status(200)
    .json(new ApiResponse(200, invoice, "Invoice fetched successfully"));
});

export const handleRecurringBillingBatch = asyncHandler(async (req, res) => {
  const results = await billingService.runRecurringBillingBatch();
  return res
    .status(200)
    .json(new ApiResponse(200, results, "Recurring billing batch executed successfully"));
});

export const handleGetTaxRules = asyncHandler(async (req, res) => {
  const taxRules = await billingService.getTaxRules();
  return res
    .status(200)
    .json(new ApiResponse(200, taxRules, "Tax rules fetched successfully"));
});

export const handleUpdateTaxRate = asyncHandler(async (req, res) => {
  const { rate } = req.body;
  const taxRule = await billingService.updateTaxRate(rate);
  return res
    .status(200)
    .json(new ApiResponse(200, taxRule, "Tax rate updated successfully"));
});

export const handleGetDiscountRules = asyncHandler(async (req, res) => {
  const discounts = await billingService.getDiscountRules();
  return res
    .status(200)
    .json(new ApiResponse(200, discounts, "Discount rules fetched successfully"));
});

export const handleCreateDiscountRule = asyncHandler(async (req, res) => {
  const rule = await billingService.createDiscountRule(req.body);
  return res
    .status(201)
    .json(new ApiResponse(201, rule, "Discount rule created successfully"));
});

