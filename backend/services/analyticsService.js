import { Subscription } from "../Modals/Subscription.js";
import { Invoice } from "../Modals/Invoice.js";
import { Payment } from "../Modals/Payment.js";

export const getFinanceOverview = async (period = "this_month", user) => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const currentYearMonth = todayStr.slice(0, 7);

  const customerFilter = user.role === "Customer" ? { customerId: user._id } : {};

  const [activeSubs, allConfirmedInvoices, payments] = await Promise.all([
    Subscription.find({ ...customerFilter, status: "Active" }).populate("planId"),
    Invoice.find({ ...customerFilter, status: "Confirmed" }),
    Payment.find(customerFilter),
  ]);

  let mrr = 0;
  for (const sub of activeSubs) {
    const planPrice = sub.planId ? sub.planId.price : 0;
    const subtotal = planPrice * sub.seats;
    const discountAmount = Math.round((subtotal * (sub.discount || 0)) / 100);
    const net = subtotal - discountAmount;
    if (sub.planId && sub.planId.cycle === "Yearly") {
      mrr += net / 12;
    } else {
      mrr += net;
    }
  }

  let collectedRevenue = 0;
  for (const pay of payments) {
    if (period === "this_month") {
      if (pay.date && pay.date.startsWith(currentYearMonth)) {
        collectedRevenue += pay.amount;
      }
    } else {
      collectedRevenue += pay.amount;
    }
  }

  let outstandingBalance = 0;
  let overdueCount = 0;
  let overdueAmount = 0;
  const overdueInvoices = [];

  for (const inv of allConfirmedInvoices) {
    outstandingBalance += inv.total;
    if (inv.due < todayStr) {
      overdueCount += 1;
      overdueAmount += inv.total;
      overdueInvoices.push(inv);
    }
  }

  return {
    mrr: Math.round(mrr),
    arr: Math.round(mrr * 12),
    activeSubscriptionsCount: activeSubs.length,
    collectedRevenue,
    outstandingBalance,
    overdueCount,
    overdueAmount,
    overdueInvoices: overdueInvoices.slice(0, 10),
    period,
  };
};

export const getOverdueInvoicesList = async (user) => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const filter = {
    status: "Confirmed",
    due: { $lt: todayStr },
  };

  if (user.role === "Customer") {
    filter.customerId = user._id;
  }

  return Invoice.find(filter)
    .populate("subscriptionId")
    .sort({ due: 1 });
};

