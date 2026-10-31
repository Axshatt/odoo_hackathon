import { Invoice } from "../Modals/Invoice.js";
import { Subscription } from "../Modals/Subscription.js";
import { Plan } from "../Modals/Plan.js";
import { TaxRule } from "../Modals/TaxRule.js";
import { DiscountRule } from "../Modals/DiscountRule.js";
import { ApiError } from "../utils/Constructors/ApiError.js";

export const getDefaultTaxRate = async () => {
  const defaultTax = await TaxRule.findOne({ isDefault: true, isActive: true });
  return defaultTax ? defaultTax.rate : 18;
};

export const generateInvoiceForSubscription = async (subscriptionId, user) => {
  const sub = await Subscription.findById(subscriptionId).populate("planId");
  if (!sub) {
    throw new ApiError(404, "Subscription not found");
  }

  if (sub.status !== "Active") {
    throw new ApiError(400, "Activate the subscription before billing.");
  }

  const existingInvoice = await Invoice.findOne({
    subscriptionId: sub._id,
    period: sub.next,
    status: { $ne: "Cancelled" },
  });

  if (existingInvoice) {
    throw new ApiError(400, "This billing period already has an invoice.");
  }

  const taxRate = await getDefaultTaxRate();
  const planPrice = sub.planId.price;
  const subtotal = planPrice * sub.seats;
  const discountAmount = Math.round((subtotal * (sub.discount || 0)) / 100);
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round((taxableAmount * taxRate) / 100);
  const total = taxableAmount + taxAmount;

  const count = await Invoice.countDocuments();
  const invoiceNumber = `INV-${String(1049 + count).padStart(4, "0")}`;

  const issueDate = new Date().toISOString().slice(0, 10);

  const invoice = await Invoice.create({
    invoiceNumber,
    subscriptionId: sub._id,
    customerId: sub.customerId,
    customer: sub.customer,
    email: sub.email,
    period: sub.next,
    issueDate,
    due: sub.next,
    lines: [
      {
        description: `${sub.planId.name} Plan (${sub.seats} seats)`,
        quantity: sub.seats,
        unitPrice: planPrice,
        amount: subtotal,
      },
    ],
    subtotal,
    discount: discountAmount,
    tax: taxAmount,
    total,
    status: "Draft",
  });

  return invoice;
};

export const confirmInvoice = async (invoiceId, user) => {
  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) {
    throw new ApiError(404, "Invoice not found");
  }

  if (invoice.status !== "Draft") {
    throw new ApiError(400, `Cannot confirm an invoice with status ${invoice.status}`);
  }

  invoice.status = "Confirmed";
  await invoice.save();
  return invoice;
};

export const cancelInvoice = async (invoiceId, user) => {
  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) {
    throw new ApiError(404, "Invoice not found");
  }

  if (invoice.status === "Paid") {
    throw new ApiError(400, "Cannot cancel an invoice that has already been paid");
  }

  invoice.status = "Cancelled";
  await invoice.save();
  return invoice;
};

export const getInvoices = async (query = {}, user) => {
  const filter = {};

  if (user.role === "Customer") {
    filter.customerId = user._id;
  } else if (query.customerId) {
    filter.customerId = query.customerId;
  }

  if (query.status && query.status !== "All") {
    filter.status = query.status;
  }

  if (query.subscriptionId) {
    filter.subscriptionId = query.subscriptionId;
  }

  if (query.search) {
    const searchRegex = new RegExp(query.search, "i");
    filter.$or = [
      { invoiceNumber: searchRegex },
      { customer: searchRegex },
      { email: searchRegex },
    ];
  }

  return Invoice.find(filter)
    .populate("subscriptionId")
    .sort({ createdAt: -1 });
};

export const getInvoiceById = async (id, user) => {
  const invoice = await Invoice.findById(id).populate("subscriptionId");
  if (!invoice) {
    throw new ApiError(404, "Invoice not found");
  }

  if (
    user.role === "Customer" &&
    invoice.customerId.toString() !== user._id.toString()
  ) {
    throw new ApiError(403, "Access denied: Not your invoice");
  }

  return invoice;
};

export const runRecurringBillingBatch = async () => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const dueSubscriptions = await Subscription.find({
    status: "Active",
    next: { $lte: todayStr },
  }).populate("planId");

  const results = {
    processed: 0,
    created: 0,
    skipped: 0,
    invoices: [],
  };

  for (const sub of dueSubscriptions) {
    results.processed += 1;
    const existing = await Invoice.findOne({
      subscriptionId: sub._id,
      period: sub.next,
      status: { $ne: "Cancelled" },
    });

    if (existing) {
      results.skipped += 1;
      continue;
    }

    try {
      const taxRate = await getDefaultTaxRate();
      const planPrice = sub.planId.price;
      const subtotal = planPrice * sub.seats;
      const discountAmount = Math.round((subtotal * (sub.discount || 0)) / 100);
      const taxableAmount = Math.max(0, subtotal - discountAmount);
      const taxAmount = Math.round((taxableAmount * taxRate) / 100);
      const total = taxableAmount + taxAmount;

      const count = await Invoice.countDocuments();
      const invoiceNumber = `INV-${String(1049 + count).padStart(4, "0")}`;

      const invoice = await Invoice.create({
        invoiceNumber,
        subscriptionId: sub._id,
        customerId: sub.customerId,
        customer: sub.customer,
        email: sub.email,
        period: sub.next,
        issueDate: todayStr,
        due: sub.next,
        lines: [
          {
            description: `${sub.planId.name} Plan (${sub.seats} seats)`,
            quantity: sub.seats,
            unitPrice: planPrice,
            amount: subtotal,
          },
        ],
        subtotal,
        discount: discountAmount,
        tax: taxAmount,
        total,
        status: "Confirmed",
      });

      results.created += 1;
      results.invoices.push(invoice);
    } catch (err) {
      results.skipped += 1;
    }
  }

  return results;
};

export const getTaxRules = async () => {
  return TaxRule.find().sort({ createdAt: -1 });
};

export const updateTaxRate = async (rate) => {
  let defaultTax = await TaxRule.findOne({ isDefault: true });
  if (defaultTax) {
    defaultTax.rate = rate;
    await defaultTax.save();
    return defaultTax;
  }
  return TaxRule.create({
    name: "Standard GST",
    rate,
    isDefault: true,
  });
};

export const getDiscountRules = async () => {
  return DiscountRule.find().sort({ createdAt: -1 });
};

export const createDiscountRule = async (data) => {
  return DiscountRule.create(data);
};

