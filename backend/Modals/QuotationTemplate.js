import mongoose from "mongoose";

const quoteLineSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variantName: {
      type: String,
      default: "",
    },
    variantOption: {
      type: String,
      default: "",
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { _id: false }
);

const quotationTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },
    productLines: [quoteLineSchema],
    validityDays: {
      type: Number,
      default: 30,
    },
    notes: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const QuotationTemplate = mongoose.model(
  "QuotationTemplate",
  quotationTemplateSchema
);

