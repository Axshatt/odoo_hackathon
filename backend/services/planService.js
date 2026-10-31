import { Plan } from "../Modals/Plan.js";
import { ApiError } from "../utils/Constructors/ApiError.js";

export const createPlan = async (data) => {
  const existing = await Plan.findOne({ code: data.code?.toLowerCase() });
  if (existing) {
    throw new ApiError(409, "A plan with this code already exists");
  }
  return Plan.create({
    ...data,
    code: data.code?.toLowerCase(),
  });
};

export const getPlans = async (filter = {}) => {
  return Plan.find(filter).sort({ price: 1 });
};

export const getPlanById = async (id) => {
  const plan = await Plan.findById(id);
  if (!plan) {
    throw new ApiError(404, "Plan not found");
  }
  return plan;
};

export const updatePlan = async (id, updateData) => {
  const plan = await Plan.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
  if (!plan) {
    throw new ApiError(404, "Plan not found");
  }
  return plan;
};

export const deletePlan = async (id) => {
  const plan = await Plan.findByIdAndDelete(id);
  if (!plan) {
    throw new ApiError(404, "Plan not found");
  }
  return plan;
};

