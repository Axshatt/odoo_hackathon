import mongoose from "mongoose";

const invoiceItemSchema = new mongoose.Schema(
  {
    description: String,
    quantity: Number,
    unitPrice: Number,
    amount: Number,
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      required: true,
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
      default: "",
    },
    period: {
      type: String,
      required: true,
      index: true,
    },
    issueDate: {
      type: String,
      required: true,
    },
    due: {
      type: String,
      required: true,
      index: true,
    },
    lines: [invoiceItemSchema],
    subtotal: {
      type: Number,
      required: true,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Draft", "Confirmed", "Paid", "Cancelled"],
      default: "Draft",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

invoiceSchema.index({ subscriptionId: 1, period: 1 });

export const Invoice = mongoose.model("Invoice", invoiceSchema);

