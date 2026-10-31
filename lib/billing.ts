export type Role = "Admin" | "Staff" | "Customer";
export type Status =
  "Draft" | "Quotation" | "Confirmed" | "Active" | "Paused" | "Closed";
export type Plan = {
  id: string;
  name: string;
  price: number;
  cycle: "Monthly" | "Yearly";
  description: string;
  features: string[];
};
export type Subscription = {
  id: string;
  customer: string;
  email: string;
  planId: string;
  seats: number;
  status: Status;
  start: string;
  next: string;
  discount: number;
};
export type Invoice = {
  id: string;
  subscriptionId: string;
  customer: string;
  period: string;
  due: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: "Draft" | "Confirmed" | "Paid" | "Cancelled";
};
export type Payment = {
  id: string;
  invoiceId: string;
  customer: string;
  amount: number;
  date: string;
  method: string;
  note: string;
};
export type Store = {
  subscriptions: Subscription[];
  invoices: Invoice[];
  payments: Payment[];
  plans: Plan[];
  tax: number;
  discount: number;
  staff: string[];
};
export const money = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
export const today = () => new Date().toISOString().slice(0, 10);
export function nextDate(date: string, cycle: Plan["cycle"]) {
  const d = new Date(date + "T12:00:00");
  const day = d.getDate();
  d.setDate(1);
  if (cycle === "Monthly") d.setMonth(d.getMonth() + 1);
  else d.setFullYear(d.getFullYear() + 1);
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, last));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function createInvoice(store: Store, sub: Subscription): Invoice {
  if (sub.status !== "Active")
    throw new Error("Activate the subscription before billing.");
  if (
    store.invoices.some(
      (i) =>
        i.subscriptionId === sub.id &&
        i.period === sub.next &&
        i.status !== "Cancelled",
    )
  )
    throw new Error("This billing period already has an invoice.");
  const plan = store.plans.find((p) => p.id === sub.planId)!;
  const subtotal = plan.price * sub.seats;
  const discount = Math.round((subtotal * sub.discount) / 100);
  const tax = Math.round(((subtotal - discount) * store.tax) / 100);
  return {
    id: `INV-${String(store.invoices.length + 1049).padStart(4, "0")}`,
    subscriptionId: sub.id,
    customer: sub.customer,
    period: sub.next,
    due: sub.next,
    subtotal,
    discount,
    tax,
    total: subtotal - discount + tax,
    status: "Draft",
  };
}
export const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 1499,
    cycle: "Monthly",
    description: "A good place to begin.",
    features: [
      "Core business workspace",
      "Up to 5 team members",
      "Email support",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    price: 3999,
    cycle: "Monthly",
    description: "Room for your next chapter.",
    features: [
      "Everything in Starter",
      "Advanced reporting",
      "Priority support",
    ],
  },
  {
    id: "scale",
    name: "Scale",
    price: 39990,
    cycle: "Yearly",
    description: "Built for the bigger picture.",
    features: [
      "Everything in Growth",
      "Dedicated account manager",
      "Annual billing",
    ],
  },
];
const names = [
  "Linear Studio",
  "Acme Technologies",
  "Orbit Digital",
  "Northstar Labs",
  "Forma Design",
  "Untitled Ventures",
  "Layers Studio",
  "Capsule Commerce",
];
const subs: Subscription[] = names.map((customer, i) => ({
  id: `SUB-${1041 + i}`,
  customer,
  email:
    i === 0
      ? "alex@linear.studio"
      : `billing@${customer.toLowerCase().replaceAll(" ", "")}.com`,
  planId: i % 3 === 2 ? "scale" : i % 3 === 1 ? "starter" : "growth",
  seats: [12, 8, 3, 6, 4, 2, 5, 9][i],
  status: i === 5 ? "Quotation" : i === 6 ? "Paused" : "Active",
  start: "2026-10-01",
  next: `2026-11-${String(1 + i * 3).padStart(2, "0")}`,
  discount: i === 0 ? 10 : 0,
}));
export function initialStore(): Store {
  const store: Store = {
    subscriptions: subs,
    invoices: [],
    payments: [],
    plans,
    tax: 18,
    discount: 10,
    staff: ["Jamie Lee"],
  };
  store.invoices = subs
    .filter((s) => s.status === "Active")
    .map((s, i) => ({
      ...createInvoice({ ...store, invoices: Array(i).fill({}) }, s),
      period: "2026-10-01",
      due: i < 2 ? "2026-10-25" : "2026-11-06",
      status: i > 1 ? "Paid" : "Confirmed",
    }));
  store.payments = store.invoices
    .filter((i) => i.status === "Paid")
    .map((i, n) => ({
      id: `PAY-${201 + n}`,
      invoiceId: i.id,
      customer: i.customer,
      amount: i.total,
      date: `2026-10-${12 + n * 4}`,
      method: n % 2 ? "UPI" : "Bank transfer",
      note: "October subscription",
    }));
  return store;
}
