import { asyncHandler } from "../utils/Constructors/asyncHandler.js";
import { ApiResponse } from "../utils/Constructors/ApiResponse.js";
import * as subscriptionService from "../services/subscriptionService.js";

export const handleCreateSubscription = asyncHandler(async (req, res) => {
  const subscription = await subscriptionService.createSubscription(
    req.body,
    req.user
  );
  return res
    .status(201)
    .json(new ApiResponse(201, subscription, "Subscription created successfully"));
});

export const handleGetSubscriptions = asyncHandler(async (req, res) => {
  const subscriptions = await subscriptionService.getSubscriptions(
    req.query,
    req.user
  );
  return res
    .status(200)
    .json(new ApiResponse(200, subscriptions, "Subscriptions fetched successfully"));
});

export const handleGetSubscriptionById = asyncHandler(async (req, res) => {
  const subscription = await subscriptionService.getSubscriptionById(
    req.params.id,
    req.user
  );
  return res
    .status(200)
    .json(new ApiResponse(200, subscription, "Subscription fetched successfully"));
});

export const handleUpdateStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const subscription = await subscriptionService.updateSubscriptionStatus(
    req.params.id,
    status,
    req.user,
    note
  );
  return res
    .status(200)
    .json(new ApiResponse(200, subscription, "Subscription status updated successfully"));
});

