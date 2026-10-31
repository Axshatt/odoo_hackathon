import { asyncHandler } from "../utils/Constructors/asyncHandler.js";
import { ApiResponse } from "../utils/Constructors/ApiResponse.js";
import * as quoteService from "../services/quoteService.js";

export const handleCreateTemplate = asyncHandler(async (req, res) => {
  const template = await quoteService.createTemplate(req.body);
  return res
    .status(201)
    .json(new ApiResponse(201, template, "Template created successfully"));
});

export const handleGetTemplates = asyncHandler(async (req, res) => {
  const templates = await quoteService.getTemplates(req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, templates, "Templates fetched successfully"));
});

export const handleGetTemplateById = asyncHandler(async (req, res) => {
  const template = await quoteService.getTemplateById(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, template, "Template fetched successfully"));
});

export const handleUpdateTemplate = asyncHandler(async (req, res) => {
  const template = await quoteService.updateTemplate(req.params.id, req.body);
  return res
    .status(200)
    .json(new ApiResponse(200, template, "Template updated successfully"));
});

export const handleDeleteTemplate = asyncHandler(async (req, res) => {
  const template = await quoteService.deleteTemplate(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, template, "Template deleted successfully"));
});

