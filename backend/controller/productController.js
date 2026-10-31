import { asyncHandler } from "../utils/Constructors/asyncHandler.js";
import { ApiResponse } from "../utils/Constructors/ApiResponse.js";
import * as productService from "../services/productService.js";

export const handleCreateProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body);
  return res
    .status(201)
    .json(new ApiResponse(201, product, "Product created successfully"));
});

export const handleGetProducts = asyncHandler(async (req, res) => {
  const products = await productService.getProducts(req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, products, "Products fetched successfully"));
});

export const handleGetProductById = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product fetched successfully"));
});

export const handleUpdateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product updated successfully"));
});

export const handleDeleteProduct = asyncHandler(async (req, res) => {
  const product = await productService.deleteProduct(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product deleted successfully"));
});

