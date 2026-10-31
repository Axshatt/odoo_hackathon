import { asyncHandler } from "../utils/Constructors/asyncHandler.js";
import { ApiResponse } from "../utils/Constructors/ApiResponse.js";
import * as paymentService from "../services/paymentService.js";

export const handleRecordPayment = asyncHandler(async (req, res) => {
  const result = await paymentService.recordPayment(req.body, req.user);
  return res
    .status(201)
    .json(new ApiResponse(201, result, "Payment recorded successfully"));
});

export const handleGetPayments = asyncHandler(async (req, res) => {
  const payments = await paymentService.getPayments(req.query, req.user);
  return res
    .status(200)
    .json(new ApiResponse(200, payments, "Payments fetched successfully"));
});

export const handleGetPaymentById = asyncHandler(async (req, res) => {
  const payment = await paymentService.getPaymentById(req.params.id, req.user);
  return res
    .status(200)
    .json(new ApiResponse(200, payment, "Payment fetched successfully"));
});

