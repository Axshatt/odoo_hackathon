import { Product } from "../Modals/Product.js";
import { ApiError } from "../utils/Constructors/ApiError.js";

export const createProduct = async (data) => {
  return Product.create(data);
};

export const getProducts = async (filter = {}) => {
  return Product.find(filter).sort({ createdAt: -1 });
};

export const getProductById = async (id) => {
  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }
  return product;
};

export const updateProduct = async (id, updateData) => {
  const product = await Product.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
  if (!product) {
    throw new ApiError(404, "Product not found");
  }
  return product;
};

export const deleteProduct = async (id) => {
  const product = await Product.findByIdAndDelete(id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }
  return product;
};

