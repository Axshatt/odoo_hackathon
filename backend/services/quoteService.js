import { QuotationTemplate } from "../Modals/QuotationTemplate.js";
import { ApiError } from "../utils/Constructors/ApiError.js";

export const createTemplate = async (data) => {
  return QuotationTemplate.create(data);
};

export const getTemplates = async (filter = {}) => {
  return QuotationTemplate.find(filter)
    .populate("planId")
    .populate("productLines.productId")
    .sort({ createdAt: -1 });
};

export const getTemplateById = async (id) => {
  const template = await QuotationTemplate.findById(id)
    .populate("planId")
    .populate("productLines.productId");
  if (!template) {
    throw new ApiError(404, "Quotation template not found");
  }
  return template;
};

export const updateTemplate = async (id, updateData) => {
  const template = await QuotationTemplate.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
  if (!template) {
    throw new ApiError(404, "Quotation template not found");
  }
  return template;
};

export const deleteTemplate = async (id) => {
  const template = await QuotationTemplate.findByIdAndDelete(id);
  if (!template) {
    throw new ApiError(404, "Quotation template not found");
  }
  return template;
};

