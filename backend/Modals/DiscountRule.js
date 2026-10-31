import mongoose from "mongoose";

const discountRuleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
      default: "percentage",
    },
    value: {
      type: Number,
      required: true,
    },
    minPurchaseAmount: {
      type: Number,
      default: 0,
    },
    minQuantity: {
      type: Number,
      default: 1,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    maxUsageCount: {
      type: Number,
      default: null,
    },
    currentUsageCount: {
      type: Number,
      default: 0,
    },
    appliesTo: {
      type: String,
      enum: ["whole_subscription", "specific_products"],
      default: "whole_subscription",
    },
    productIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const DiscountRule = mongoose.model("DiscountRule", discountRuleSchema);

