import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    cycle: {
      type: String,
      enum: ["daily", "weekly", "Monthly", "Yearly"],
      required: true,
      default: "Monthly",
    },
    description: {
      type: String,
      default: "",
    },
    features: {
      type: [String],
      default: [],
    },
    minQuantity: {
      type: Number,
      default: 1,
    },
    availableFrom: {
      type: Date,
      default: null,
    },
    availableTo: {
      type: Date,
      default: null,
    },
    autoCloseOnEnd: {
      type: Boolean,
      default: false,
    },
    allowEarlyClose: {
      type: Boolean,
      default: true,
    },
    allowPause: {
      type: Boolean,
      default: true,
    },
    allowRenewal: {
      type: Boolean,
      default: true,
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

export const Plan = mongoose.model("Plan", planSchema);

