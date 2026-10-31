import { asyncHandler } from "../utils/Constructors/asyncHandler.js";
import { ApiResponse } from "../utils/Constructors/ApiResponse.js";
import * as planService from "../services/planService.js";

export const handleCreatePlan = asyncHandler(async (req, res) => {
  const plan = await planService.createPlan(req.body);
  return res
    .status(201)
    .json(new ApiResponse(201, plan, "Plan created successfully"));
});

export const handleGetPlans = asyncHandler(async (req, res) => {
  const plans = await planService.getPlans(req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, plans, "Plans fetched successfully"));
});

export const handleGetPlanById = asyncHandler(async (req, res) => {
  const plan = await planService.getPlanById(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, plan, "Plan fetched successfully"));
});

export const handleUpdatePlan = asyncHandler(async (req, res) => {
  const plan = await planService.updatePlan(req.params.id, req.body);
  return res
    .status(200)
    .json(new ApiResponse(200, plan, "Plan updated successfully"));
});

export const handleDeletePlan = asyncHandler(async (req, res) => {
  const plan = await planService.deletePlan(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, plan, "Plan deleted successfully"));
});

