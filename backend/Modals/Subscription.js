import mongoose from "mongoose";

const subLineSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    productName: {
      type: String,
      default: "",
    },
    variant: {
      type: String,
      default: "",
    },
    quantity: {
      type: Number,
      default: 1,
    },
    unitPrice: {
      type: Number,
      default: 0,
    },
    taxes: {
      type: Number,
      default: 0,
    },
    amount: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const historySchema = new mongoose.Schema(
  {
    fromStatus: String,
    toStatus: String,
    changedAt: { type: Date, default: Date.now },
    changedBy: String,
    note: String,
  },
  { _id: false }
);

const subscriptionSchema = new mongoose.Schema(
  {
    subscriptionNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    customer: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
      index: true,
    },
    seats: {
      type: Number,
      required: true,
      min: 1,
      max: 10000,
      default: 1,
    },
    status: {
      type: String,
      enum: ["Draft", "Quotation", "Confirmed", "Active", "Paused", "Closed"],
      default: "Draft",
      index: true,
    },
    start: {
      type: String,
      required: true,
    },
    next: {
      type: String,
      required: true,
      index: true,
    },
    expiryDate: {
      type: String,
      default: null,
    },
    paymentTerms: {
      type: String,
      default: "Immediate",
    },
    discount: {
      type: Number,
      default: 0,
    },
    lines: [subLineSchema],
    history: [historySchema],
  },
  {
    timestamps: true,
  }
);

export const Subscription = mongoose.model("Subscription", subscriptionSchema);

