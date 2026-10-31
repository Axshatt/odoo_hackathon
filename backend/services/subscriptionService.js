import { Subscription } from "../Modals/Subscription.js";
import { Plan } from "../Modals/Plan.js";
import { User } from "../Modals/User.js";
import { ApiError } from "../utils/Constructors/ApiError.js";

export const calculateNextBillingDate = (dateStr, cycle = "Monthly") => {
  const d = new Date(dateStr + "T12:00:00Z");
  const day = d.getUTCDate();
  d.setUTCDate(1);

  if (cycle === "daily") {
    const nextD = new Date(dateStr + "T12:00:00Z");
    nextD.setUTCDate(nextD.getUTCDate() + 1);
    return nextD.toISOString().slice(0, 10);
  }

  if (cycle === "weekly") {
    const nextD = new Date(dateStr + "T12:00:00Z");
    nextD.setUTCDate(nextD.getUTCDate() + 7);
    return nextD.toISOString().slice(0, 10);
  }

  if (cycle === "Yearly") {
    d.setUTCFullYear(d.getUTCFullYear() + 1);
  } else {
    d.setUTCMonth(d.getUTCMonth() + 1);
  }

  const lastDay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, lastDay));

  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
};

export const createSubscription = async (data, user) => {
  const plan = await Plan.findById(data.planId);
  if (!plan) {
    throw new ApiError(404, "Plan not found");
  }

  let customerId = data.customerId;
  let customerName = data.customer;
  let customerEmail = data.email;

  if (user.role === "Customer") {
    customerId = user._id;
    customerName = user.companyName || user.name;
    customerEmail = user.email;
  } else if (!customerId) {
    const existingCustomer = await User.findOne({ email: customerEmail?.toLowerCase() });
    if (existingCustomer) {
      customerId = existingCustomer._id;
    } else {
      const newCustomer = await User.create({
        name: customerName,
        email: customerEmail?.toLowerCase(),
        password: "TempPassword123!",
        role: "Customer",
        companyName: customerName,
      });
      customerId = newCustomer._id;
    }
  }

  const count = await Subscription.countDocuments();
  const subscriptionNumber = `SUB-${1041 + count}`;

  const startDate = data.start || new Date().toISOString().slice(0, 10);
  const nextDate = data.next || calculateNextBillingDate(startDate, plan.cycle);

  const initialStatus = user.role === "Customer" ? "Active" : data.status || "Draft";

  const subscription = await Subscription.create({
    subscriptionNumber,
    customerId,
    customer: customerName,
    email: customerEmail,
    planId: plan._id,
    seats: data.seats || 1,
    status: initialStatus,
    start: startDate,
    next: nextDate,
    expiryDate: data.expiryDate || null,
    paymentTerms: data.paymentTerms || "Immediate",
    discount: data.discount || 0,
    lines: data.lines || [],
    history: [
      {
        fromStatus: null,
        toStatus: initialStatus,
        changedAt: new Date(),
        changedBy: user.email,
        note: "Subscription created",
      },
    ],
  });

  return Subscription.findById(subscription._id).populate("planId").populate("customerId", "name email");
};

export const getSubscriptions = async (query = {}, user) => {
  const filter = {};

  if (user.role === "Customer") {
    filter.customerId = user._id;
  } else if (query.customerId) {
    filter.customerId = query.customerId;
  }

  if (query.status && query.status !== "All") {
    filter.status = query.status;
  }

  if (query.search) {
    const searchRegex = new RegExp(query.search, "i");
    filter.$or = [
      { customer: searchRegex },
      { email: searchRegex },
      { subscriptionNumber: searchRegex },
    ];
  }

  return Subscription.find(filter)
    .populate("planId")
    .populate("customerId", "name email")
    .sort({ createdAt: -1 });
};

export const getSubscriptionById = async (id, user) => {
  const subscription = await Subscription.findById(id)
    .populate("planId")
    .populate("customerId", "name email");

  if (!subscription) {
    throw new ApiError(404, "Subscription not found");
  }

  if (
    user.role === "Customer" &&
    subscription.customerId._id.toString() !== user._id.toString()
  ) {
    throw new ApiError(403, "Access denied: Not your subscription");
  }

  return subscription;
};

export const updateSubscriptionStatus = async (id, newStatus, user, note = "") => {
  const subscription = await Subscription.findById(id).populate("planId");
  if (!subscription) {
    throw new ApiError(404, "Subscription not found");
  }

  if (
    user.role === "Customer" &&
    subscription.customerId.toString() !== user._id.toString()
  ) {
    throw new ApiError(403, "Access denied: Not your subscription");
  }

  const current = subscription.status;
  const allowedCustomerTransitions = {
    Active: ["Paused", "Closed"],
    Paused: ["Active"],
    Closed: ["Active"],
  };

  const allowedStaffTransitions = {
    Draft: ["Quotation", "Confirmed", "Closed"],
    Quotation: ["Draft", "Confirmed", "Closed"],
    Confirmed: ["Active", "Draft", "Closed"],
    Active: ["Paused", "Closed"],
    Paused: ["Active", "Closed"],
    Closed: ["Active"],
  };

  const rules =
    user.role === "Customer"
      ? allowedCustomerTransitions
      : allowedStaffTransitions;

  if (!rules[current] || !rules[current].includes(newStatus)) {
    throw new ApiError(
      400,
      `Cannot transition subscription from ${current} to ${newStatus}`
    );
  }

  if (newStatus === "Closed" && !subscription.planId.allowEarlyClose && user.role === "Customer") {
    throw new ApiError(400, "Plan policy does not permit early closure by customer");
  }

  if (newStatus === "Paused" && !subscription.planId.allowPause) {
    throw new ApiError(400, "Plan policy does not permit pausing");
  }

  subscription.status = newStatus;
  subscription.history.push({
    fromStatus: current,
    toStatus: newStatus,
    changedAt: new Date(),
    changedBy: user.email,
    note: note || `Status changed to ${newStatus}`,
  });

  await subscription.save();
  return Subscription.findById(id).populate("planId").populate("customerId", "name email");
};

