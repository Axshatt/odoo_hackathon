import mongoose from "mongoose";

const taxRuleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    rate: {
      type: Number,
      required: true,
      default: 18,
    },
    country: {
      type: String,
      default: "India",
    },
    isDefault: {
      type: Boolean,
      default: false,
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

export const TaxRule = mongoose.model("TaxRule", taxRuleSchema);

