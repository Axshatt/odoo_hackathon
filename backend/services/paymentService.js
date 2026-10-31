import { Payment } from "../Modals/Payment.js";
import { Invoice } from "../Modals/Invoice.js";
import { Subscription } from "../Modals/Subscription.js";
import { Plan } from "../Modals/Plan.js";
import { calculateNextBillingDate } from "./subscriptionService.js";
import { ApiError } from "../utils/Constructors/ApiError.js";

export const recordPayment = async (data, user) => {
  const invoice = await Invoice.findById(data.invoiceId);
  if (!invoice) {
    throw new ApiError(404, "Invoice not found");
  }

  if (
    user.role === "Customer" &&
    invoice.customerId.toString() !== user._id.toString()
  ) {
    throw new ApiError(403, "Access denied: Cannot pay for another customer's invoice");
  }

  if (invoice.status === "Paid") {
    throw new ApiError(400, "This invoice is already marked as Paid");
  }

  if (invoice.status === "Cancelled") {
    throw new ApiError(400, "Cannot record payment on a cancelled invoice");
  }

  const count = await Payment.countDocuments();
  const paymentNumber = `PAY-${201 + count}`;

  const paymentDate = data.date || new Date().toISOString().slice(0, 10);
  const paymentAmount = data.amount || invoice.total;

  const payment = await Payment.create({
    paymentNumber,
    invoiceId: invoice._id,
    subscriptionId: invoice.subscriptionId,
    customerId: invoice.customerId,
    customer: invoice.customer,
    amount: paymentAmount,
    date: paymentDate,
    method: data.method || "Bank transfer",
    note: data.note || "Subscription payment",
  });

  invoice.status = "Paid";
  await invoice.save();

  const subscription = await Subscription.findById(invoice.subscriptionId).populate("planId");
  if (subscription && subscription.next === invoice.period) {
    const cycle = subscription.planId ? subscription.planId.cycle : "Monthly";
    subscription.next = calculateNextBillingDate(subscription.next, cycle);
    await subscription.save();
  }

  return { payment, invoice };
};

export const getPayments = async (query = {}, user) => {
  const filter = {};

  if (user.role === "Customer") {
    filter.customerId = user._id;
  } else if (query.customerId) {
    filter.customerId = query.customerId;
  }

  if (query.invoiceId) {
    filter.invoiceId = query.invoiceId;
  }

  return Payment.find(filter)
    .populate("invoiceId")
    .populate("subscriptionId")
    .sort({ createdAt: -1 });
};

export const getPaymentById = async (id, user) => {
  const payment = await Payment.findById(id)
    .populate("invoiceId")
    .populate("subscriptionId");

  if (!payment) {
    throw new ApiError(404, "Payment not found");
  }

  if (
    user.role === "Customer" &&
    payment.customerId.toString() !== user._id.toString()
  ) {
    throw new ApiError(403, "Access denied: Not your payment");
  }

  return payment;
};

