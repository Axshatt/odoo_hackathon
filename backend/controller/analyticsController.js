import { asyncHandler } from "../utils/Constructors/asyncHandler.js";
import { ApiResponse } from "../utils/Constructors/ApiResponse.js";
import * as analyticsService from "../services/analyticsService.js";

export const handleGetOverview = asyncHandler(async (req, res) => {
  const { period } = req.query;
  const overview = await analyticsService.getFinanceOverview(period, req.user);
  return res
    .status(200)
    .json(new ApiResponse(200, overview, "Finance overview fetched successfully"));
});

export const handleGetOverdue = asyncHandler(async (req, res) => {
  const overdue = await analyticsService.getOverdueInvoicesList(req.user);
  return res
    .status(200)
    .json(new ApiResponse(200, overdue, "Overdue invoices fetched successfully"));
});

