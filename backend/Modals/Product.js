import mongoose from "mongoose";

const variantOptionSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    priceDelta: { type: Number, default: 0 },
  },
  { _id: false }
);

const variantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    options: [variantOptionSchema],
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["Software", "Addon", "Service", "Physical"],
      default: "Software",
    },
    salesPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    costPrice: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: "",
    },
    variants: [variantSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Product = mongoose.model("Product", productSchema);

