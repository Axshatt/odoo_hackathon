"use client";
import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowDownLeft,
  Plus,
  Search,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  Repeat2,
  Layers3,
  FileText,
  Wallet,
  Users,
  Settings,
  Sun,
  Moon,
  X,
  Check,
  Download,
  Menu,
  LogOut,
  Sparkles,
  Zap,
  CreditCard,
  Percent,
  TrendingUp,
  Clock,
  CheckCircle2,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { IntelligencePage } from "@/components/intelligence-page";
import { WelcomeModal } from "@/components/welcome-modal";
import {
  createInvoice,
  initialStore,
  money,
  nextDate,
  today,
  type Store,
  type Role,
  type Subscription,
  type Invoice,
  type Status,
} from "@/lib/billing";
type Page =
  | "Overview"
  | "Intelligence"
  | "Subscriptions"
  | "Products & plans"
  | "Invoices"
  | "Payments"
  | "Customers"
  | "Settings";
const navigation = [
  { name: "Intelligence", icon: Sparkles },
  { name: "Overview", icon: LayoutDashboard },
  { name: "Subscriptions", icon: Repeat2 },
  { name: "Products & plans", icon: Layers3 },
  { name: "Invoices", icon: FileText },
  { name: "Payments", icon: Wallet },
  { name: "Customers", icon: Users },
] as const;
const spring = {
  type: "spring" as const,
  stiffness: 340,
  damping: 32,
  mass: 1,
};
function Badge({ status }: { status: string }) {
  return (
    <span className={`badge ${status.toLowerCase()}`}>
      <i />
      {status}
    </span>
  );
}
function Logo() {
  return (
    <span className="brand">
      <span className="brand-symbol">
        b<span />
      </span>
      brightloop<span className="brand-dot">.</span>
    </span>
  );
}
function Modal({
  title,
  subtitle,
  children,
  onClose,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  const titleId = useId();
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
    const dialog = ref.current;
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      className="dialog"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
        className="dialog-content"
      >
        <button
          className="icon-button close"
          aria-label="Close dialog"
          onClick={onClose}
        >
          <X size={20} />
        </button>
        <span className="eyebrow">BRIGHTLOOP WORKSPACE</span>
        <h2 id={titleId}>{title}</h2>
        {subtitle && <p className="muted">{subtitle}</p>}
        {children}
      </motion.div>
    </dialog>
  );
}
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
export default function Workspace() {
  const [data, setData] = useState<Store>(initialStore);
  const [ready, setReady] = useState(false);
  const [page, setPage] = useState<Page>("Intelligence");
  const [role, setRole] = useState<Role>("Admin");
  const [dark, setDark] = useState(true);
  const [mobile, setMobile] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [period, setPeriod] = useState("This month");
  const [toast, setToast] = useState("");
  const [modal, setModal] = useState<
    "new" | "plan" | "staff" | "payment" | "account" | null
  >(null);
  const [selected, setSelected] = useState<Subscription | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [planChoice, setPlanChoice] = useState("growth");
  const [accountMode, setAccountMode] = useState<"login" | "signup" | "reset">(
    "login",
  );
  const [showWelcome, setShowWelcome] = useState(false);
  useEffect(() => {
    try {
      const welcomeSeen = localStorage.getItem("brightloop-welcome-seen");
      if (!welcomeSeen) {
        setShowWelcome(true);
      }
      const saved = localStorage.getItem("brightloop-v1");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          Array.isArray(parsed.subscriptions) &&
          Array.isArray(parsed.plans) &&
          Array.isArray(parsed.invoices) &&
          Array.isArray(parsed.payments) &&
          Array.isArray(parsed.staff)
        )
          setData(parsed);
      }
      const savedTheme = localStorage.getItem("brightloop-theme");
      if (savedTheme) {
        setDark(savedTheme === "dark");
      } else {
        setDark(true);
      }
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) localStorage.setItem("brightloop-v1", JSON.stringify(data));
  }, [data, ready]);
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    if (ready)
      localStorage.setItem("brightloop-theme", dark ? "dark" : "light");
  }, [dark, ready]);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);
  const customer = role === "Customer";
  const subscriptions = data.subscriptions.filter(
    (s) => !customer || s.email === "alex@linear.studio",
  );
  const invoices = data.invoices.filter((i) =>
    subscriptions.some((s) => s.id === i.subscriptionId),
  );
  const payments = data.payments.filter((p) =>
    invoices.some((i) => i.id === p.invoiceId),
  );
  const active = subscriptions.filter((s) => s.status === "Active");
  const mrr = active.reduce((a, s) => {
    const p = data.plans.find((p) => p.id === s.planId)!;
    return (
      a +
      (p.price * s.seats * (1 - s.discount / 100)) /
        (p.cycle === "Yearly" ? 12 : 1)
    );
  }, 0);
  const collected = payments
    .filter(
      (p) =>
        period === "All time" || p.date.slice(0, 7) === today().slice(0, 7),
    )
    .reduce((a, p) => a + p.amount, 0);
  const outstanding = invoices.filter((i) => i.status === "Confirmed");
  const overdue = outstanding.filter((i) => i.due < today());
  const outstandingTotal = outstanding.reduce((a, i) => a + i.total, 0);
  const totalSeats = active.reduce((acc, s) => acc + s.seats, 0);
  const arr = mrr * 12;
  const draftInvoices = invoices.filter((i) => i.status === "Draft");
  const draftTotal = draftInvoices.reduce((a, i) => a + i.total, 0);
  const pendingInvoices = invoices.filter(
    (i) => i.status === "Confirmed" && i.due >= today(),
  );
  const pendingTotal = pendingInvoices.reduce((a, i) => a + i.total, 0);
  const overdueTotal = overdue.reduce((a, i) => a + i.total, 0);
  const paidInvoices = invoices.filter((i) => i.status === "Paid");
  const paidTotal = paidInvoices.reduce((a, i) => a + i.total, 0);
  const invoiceFunnelTotal = draftTotal + pendingTotal + overdueTotal + paidTotal;
  const collectionRate =
    paidTotal + overdueTotal + pendingTotal > 0
      ? Math.round(
          (paidTotal / (paidTotal + overdueTotal + pendingTotal)) * 1000,
        ) / 10
      : 100;
  const upcomingRenewals = [...active]
    .sort((a, b) => a.next.localeCompare(b.next))
    .slice(0, 4);
  const recentActivities = [
    ...payments.map((p) => ({
      id: `act-p-${p.id}`,
      type: "payment" as const,
      title: `${p.customer} payment received`,
      subtitle: `via ${p.method} · Recorded towards invoice`,
      time: p.date,
      amount: money(p.amount),
      targetInvoice: invoices.find((inv) => inv.id === p.invoiceId) || null,
      targetSub: null as Subscription | null,
    })),
    ...overdue.map((i) => ({
      id: `act-o-${i.id}`,
      type: "overdue" as const,
      title: `${i.customer} payment overdue`,
      subtitle: `${i.id} due on ${i.due} · Follow-up needed`,
      time: i.due,
      amount: money(i.total),
      targetInvoice: i,
      targetSub: subscriptions.find((s) => s.id === i.subscriptionId) || null,
    })),
    ...invoices
      .filter((i) => i.status === "Confirmed" && i.due >= today())
      .map((i) => ({
        id: `act-c-${i.id}`,
        type: "invoice" as const,
        title: `Invoice generated for ${i.customer}`,
        subtitle: `${i.id} due ${i.due}`,
        time: i.period,
        amount: money(i.total),
        targetInvoice: i,
        targetSub: subscriptions.find((s) => s.id === i.subscriptionId) || null,
      })),
  ]
    .sort((a, b) => b.time.localeCompare(a.time))
    .slice(0, 4);
  const navigate = (p: Page) => {
    setPage(p);
    setSearch("");
    setFilter("All");
    setMobile(false);
  };
  const notify = (message: string) => setToast(message);
  const updateSub = (s: Subscription, status: Status) => {
    const updated = { ...s, status };
    setData((d) => ({
      ...d,
      subscriptions: d.subscriptions.map((x) => (x.id === s.id ? updated : x)),
    }));
    setSelected(updated);
    notify(`Subscription ${status.toLowerCase()}.`);
  };
  const bill = (s: Subscription) => {
    try {
      const i = createInvoice(data, s);
      setData((d) => ({ ...d, invoices: [i, ...d.invoices] }));
      setSelected(null);
      setInvoice(i);
      notify("Invoice drafted. Review and confirm it.");
    } catch (e) {
      notify((e as Error).message);
    }
  };
  const updateInvoice = (i: Invoice, status: Invoice["status"]) => {
    const updated = { ...i, status };
    setData((d) => ({
      ...d,
      invoices: d.invoices.map((x) => (x.id === i.id ? updated : x)),
    }));
    setInvoice(updated);
    notify(`Invoice ${status.toLowerCase()}.`);
  };
  const exportCSV = () => {
    const rows = [
      ["Invoice", "Customer", "Due", "Total INR", "Status"],
      ...invoices.map((i) => [
        i.id,
        i.customer,
        i.due,
        String(i.total),
        i.status,
      ]),
    ];
    const csv = rows
      .map((r) =>
        r
          .map(
            (v) => '"' + v.replace(/^[=+@-]/, "'").replaceAll('"', '""') + '"',
          )
          .join(","),
      )
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "brightloop-invoices.csv";
    a.click();
    URL.revokeObjectURL(url);
    notify("Invoice report exported.");
  };
  const runBillingDayBatch = () => {
    let createdCount = 0;
    const newInvoices: Invoice[] = [];
    for (const sub of active) {
      const hasInvoice = data.invoices.some(
        (i) =>
          i.subscriptionId === sub.id &&
          i.period === sub.next &&
          i.status !== "Cancelled"
      );
      if (!hasInvoice) {
        try {
          const inv = createInvoice(
            { ...data, invoices: [...newInvoices, ...data.invoices] },
            sub
          );
          newInvoices.push(inv);
          createdCount++;
        } catch {}
      }
    }
    if (createdCount > 0) {
      setData((d) => ({ ...d, invoices: [...newInvoices, ...d.invoices] }));
      notify(`Billing Day: Created ${createdCount} invoices automatically.`);
    } else {
      notify("Billing Day: All active subscriptions already have current invoices.");
    }
  };
  const quickSettleOverdue = () => {
    if (overdue.length === 0) {
      notify("No overdue invoices to settle.");
      return;
    }
    const target = overdue[0];
    const updatedInvoices = data.invoices.map((inv) =>
      inv.id === target.id ? { ...inv, status: "Paid" as const } : inv
    );
    const sub = data.subscriptions.find((s) => s.id === target.subscriptionId);
    const plan = sub ? data.plans.find((p) => p.id === sub.planId) : null;
    let updatedSubs = data.subscriptions;
    if (sub && plan && sub.next === target.period) {
      updatedSubs = data.subscriptions.map((s) =>
        s.id === sub.id ? { ...s, next: nextDate(s.next, plan.cycle) } : s
      );
    }
    const payment = {
      id: `PAY-${201 + data.payments.length}`,
      invoiceId: target.id,
      customer: target.customer,
      amount: target.total,
      date: today(),
      method: "UPI",
      note: "Instant settlement via Quick Actions",
    };
    setData((d) => ({
      ...d,
      invoices: updatedInvoices,
      payments: [payment, ...d.payments],
      subscriptions: updatedSubs,
    }));
    notify(`Settled ${money(target.total)} for ${target.customer}. Next billing advanced.`);
  };
  const submitSubscription = (form: HTMLFormElement) => {
    const f = new FormData(form);
    const planId = String(f.get("plan"));
    const plan = data.plans.find((p) => p.id === planId)!;
    const start = String(f.get("start"));
    const sub: Subscription = {
      id: `SUB-${Date.now().toString().slice(-6)}`,
      customer: customer ? "Linear Studio" : String(f.get("customer")).trim(),
      email: customer ? "alex@linear.studio" : String(f.get("email")),
      planId,
      seats: Number(f.get("seats")),
      status: customer ? "Active" : "Draft",
      start,
      next: nextDate(start, plan.cycle),
      discount: Number(f.get("discount") || 0),
    };
    setData((d) => ({ ...d, subscriptions: [sub, ...d.subscriptions] }));
    setModal(null);
    navigate("Subscriptions");
    notify(
      customer
        ? "Your subscription is active."
        : "Subscription created as a draft.",
    );
  };
  const filteredSubs = subscriptions.filter(
    (s) =>
      (filter === "All" || s.status === filter) &&
      `${s.customer} ${s.id}`.toLowerCase().includes(search.toLowerCase()),
  );
  const subTable = (items: Subscription[], compact = false) => (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Customer</th>
            <th>Plan</th>
            <th>Status</th>
            <th>{compact ? "Next billing" : "Subscription"}</th>
            <th className="text-right">Amount</th>
            <th>
              <span className="sr-only">Details</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((s) => {
            const p = data.plans.find((p) => p.id === s.planId)!;
            return (
              <tr key={s.id}>
                <td>
                  <button
                    className="customer-cell"
                    onClick={() => setSelected(s)}
                  >
                    <span className={`avatar avatar-${s.customer.length % 4}`}>
                      {s.customer
                        .split(" ")
                        .map((w) => w[0])
                        .slice(0, 2)
                        .join("")}
                    </span>
                    <span>
                      <strong>{s.customer}</strong>
                      <small>{s.email}</small>
                    </span>
                  </button>
                </td>
                <td>
                  {p.name}
                  <small>{p.cycle}</small>
                </td>
                <td>
                  <Badge status={s.status} />
                </td>
                <td>
                  {compact
                    ? new Date(s.next + "T12:00").toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : s.id}
                </td>
                <td className="text-right amount">
                  {money(p.price * s.seats * (1 - s.discount / 100))}
                  <small>/{p.cycle === "Monthly" ? "month" : "year"}</small>
                </td>
                <td>
                  <button
                    className="icon-button"
                    aria-label={`View ${s.customer} subscription`}
                    onClick={() => setSelected(s)}
                  >
                    <ChevronRight size={16} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {items.length === 0 && (
        <div className="empty">
          No subscriptions match. Try a different search or create one.
        </div>
      )}
    </div>
  );
  return (
    <MotionConfig reducedMotion="user">
      <div className="app-shell">
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        <aside className={`sidebar ${mobile ? "open" : ""}`}>
          <Logo />
          <button
            className="workspace-picker"
            onClick={() => navigate("Settings")}
          >
            <span className="workspace-icon">B</span>
            <span>
              Brightloop Software
              <small>
                {customer ? "Customer portal" : "Company workspace"}
              </small>
            </span>
            <ChevronDown size={14} />
          </button>
          <div className="nav-caption">WORKSPACE</div>
          <nav aria-label="Main navigation">
            {navigation
              .filter(
                (n) => !customer || !["Payments", "Customers"].includes(n.name),
              )
              .map(({ name, icon: Icon }) => (
                <button
                  key={name}
                  onClick={() => navigate(name)}
                  aria-current={page === name ? "page" : undefined}
                  className={`nav-item ${page === name ? "selected" : ""}`}
                >
                  <Icon size={18} strokeWidth={1.65} />
                  <span>
                    {name === "Overview" && customer ? "My overview" : name}
                  </span>
                  {name === "Subscriptions" && (
                    <span className="nav-count">{subscriptions.length}</span>
                  )}
                  {page === name && (
                    <motion.div
                      className="nav-highlight"
                      layoutId="nav-highlight"
                      transition={spring}
                    />
                  )}
                </button>
              ))}
          </nav>
          <div className="sidebar-bottom">
            <div className="workspace-note">
              <span className="tiny-dot" />A little less admin.
              <br />
              <span>A lot more possibility.</span>
              <div className="note-line" />
            </div>
            <button
              className={`nav-item ${page === "Settings" ? "selected" : ""}`}
              onClick={() => navigate("Settings")}
            >
              <Settings size={18} />
              Settings
            </button>
            <div className="profile">
              <span className="profile-avatar">{customer ? "AL" : "AS"}</span>
              <span>
                <strong>{customer ? "Alex Lee" : "Akshat Singh"}</strong>
                <small>
                  {role === "Admin"
                    ? "Workspace admin"
                    : role === "Staff"
                      ? "Operations team"
                      : "Linear Studio"}
                </small>
              </span>
              <button
                className="icon-button"
                aria-label="Account options"
                onClick={() => setModal("account")}
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </aside>
        {mobile && (
          <button
            className="mobile-scrim"
            aria-label="Close navigation"
            onClick={() => setMobile(false)}
          />
        )}
        <div className="main-shell">
          <header className="topbar">
            <div className="breadcrumb">
              <button
                className="icon-button mobile-menu"
                aria-label="Open navigation"
                onClick={() => setMobile(!mobile)}
              >
                <Menu size={20} />
              </button>
              <span>Workspace</span>
              <ChevronRight size={13} />
              <strong>{page}</strong>
            </div>
            <div className="topbar-actions">
              <span className="demo-label">
                <span />
                Live demo
              </span>
              <label className="role-picker">
                <span className="sr-only">Preview role</span>
                <select
                  aria-label="Preview role"
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value as Role);
                    navigate("Overview");
                    setSelected(null);
                    setInvoice(null);
                  }}
                >
                  <option>Admin</option>
                  <option>Staff</option>
                  <option>Customer</option>
                </select>
              </label>
              <button
                className="icon-button"
                onClick={() => setDark(!dark)}
                aria-label={dark ? "Use light mode" : "Use dark mode"}
              >
                {dark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <span className="header-avatar">{customer ? "AL" : "AS"}</span>
            </div>
          </header>
          <main id="main-content" className={page === "Intelligence" ? "chat-fullscreen-viewport" : ""}>
            <AnimatePresence mode="wait">
              <motion.div
                key={page + role}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                {page !== "Intelligence" && (
                  <div className="page-heading">
                  <div>
                    <div className="eyebrow">
                      {page === "Overview"
                        ? "YOUR BUSINESS, AT A GLANCE"
                        : "BRIGHTLOOP / " + page.toUpperCase()}
                    </div>
                    <h1>
                      {page === "Overview"
                        ? customer
                          ? "Your workspace. In focus."
                          : "A clearer picture."
                        : page === "Products & plans"
                          ? "Good plans. Great possibilities."
                          : page}
                    </h1>
                    <p>
                      {page === "Overview"
                        ? customer
                          ? "Everything you need to manage your subscription."
                          : "Your subscriptions, revenue, and what needs a little attention."
                        : ({
                              Subscriptions:
                                "Every relationship. Every renewal. In one place.",
                              "Products & plans":
                                "Simple, considered plans that grow with your business.",
                              Invoices:
                                "From the first invoice to the final payment.",
                              Payments: "Every payment, accounted for.",
                              Customers:
                                "The people behind your recurring revenue.",
                              Settings: "Make the workspace work for you.",
                            } as Record<string, string>)[page]}
                    </p>
                  </div>
                  {["Overview", "Subscriptions"].includes(page) && (
                    <button
                      className="button primary"
                      onClick={() => {
                        setPlanChoice("growth");
                        setModal("new");
                      }}
                    >
                      <Plus size={17} />
                      {customer ? "Add subscription" : "New subscription"}
                    </button>
                  )}
                  {page === "Invoices" && (
                    <button className="button" onClick={exportCSV}>
                      <Download size={16} />
                      Export report
                    </button>
                  )}
                  {page === "Products & plans" && role === "Admin" && (
                    <button
                      className="button primary"
                      onClick={() => setModal("plan")}
                    >
                      <Plus size={17} />
                      Create plan
                    </button>
                  )}
                </div>
                )}
                {page === "Intelligence" && (
                  <IntelligencePage
                    data={data}
                    setData={setData}
                    role={role}
                    navigate={navigate}
                    notify={notify}
                    setSelected={setSelected}
                    setInvoice={setInvoice}
                    setModal={setModal}
                  />
                )}
                {page === "Overview" && (
                  <>
                    <div className="section-bar">
                      <div className="segmented" aria-label="Reporting period">
                        {["This month", "All time"].map((p) => (
                          <button
                            aria-pressed={period === p}
                            key={p}
                            onClick={() => setPeriod(p)}
                          >
                            {period === p && (
                              <motion.span
                                layoutId="period"
                                transition={spring}
                              />
                            )}
                            <span>{p}</span>
                          </button>
                        ))}
                      </div>
                      <span className="date-label">
                        {new Date().toLocaleDateString("en-IN", {
                          month: "long",
                          year: "numeric",
                        })}
                        <span className="calendar-mark">▦</span>
                      </span>
                    </div>

                    {!customer && (
                      <div className="overview-quick-actions" aria-label="Quick operations">
                        <button
                          className="overview-action-chip featured"
                          onClick={runBillingDayBatch}
                          title="Run automated recurring billing for active subscriptions ready for invoicing"
                        >
                          <Zap size={15} />
                          <span>Run Auto-Billing</span>
                        </button>
                        {overdue.length > 0 && (
                          <button
                            className="overview-action-chip settle"
                            onClick={quickSettleOverdue}
                            title="Instantly settle highest priority overdue invoice"
                          >
                            <CheckCircle2 size={15} />
                            <span>Quick Settle Overdue ({overdue.length})</span>
                          </button>
                        )}
                        <button
                          className="overview-action-chip"
                          onClick={() => {
                            setPlanChoice("growth");
                            setModal("new");
                          }}
                        >
                          <Plus size={15} />
                          <span>New subscription</span>
                        </button>
                        <button
                          className="overview-action-chip"
                          onClick={() => setModal("payment")}
                        >
                          <CreditCard size={15} />
                          <span>Record payment</span>
                        </button>
                        <button
                          className="overview-action-chip"
                          onClick={exportCSV}
                        >
                          <Download size={15} />
                          <span>Export audit CSV</span>
                        </button>
                      </div>
                    )}

                    <section className="metrics" aria-label="Key metrics">
                      <Metric
                        label="Monthly recurring revenue"
                        value={money(mrr)}
                        detail={`${active.length} active recurring contracts`}
                        featured
                        badge="+14.2% MoM"
                      />
                      <Metric
                        label="Annual run rate (ARR)"
                        value={money(arr)}
                        detail="12× projected annual run velocity"
                        badge="ARR Pace"
                      />
                      <Metric
                        label="Active subscriptions"
                        value={String(active.length).padStart(2, "0")}
                        detail={`${subscriptions.filter((s) => s.status === "Quotation").length} quote pending approval`}
                        badge="98.4% Retention"
                      />
                      <Metric
                        label="Collected revenue"
                        value={money(collected)}
                        detail={
                          period === "This month"
                            ? "Recorded payments this month"
                            : "All recorded collections"
                        }
                        badge={`${payments.length} settled`}
                      />
                      <Metric
                        label="Outstanding invoices"
                        value={money(outstandingTotal)}
                        detail={`${overdue.length} overdue · requires action`}
                        warning={overdue.length > 0}
                        badge={overdue.length > 0 ? "Action needed" : "Healthy"}
                      />
                    </section>

                    <div className="overview-grid">
                      <section className="panel revenue-panel">
                        <div className="panel-head">
                          <div>
                            <h2>Revenue overview</h2>
                            <p>Recurring revenue trajectory with active forecast.</p>
                          </div>
                          <span className="chart-key">
                            <i />
                            Monthly equivalent
                          </span>
                        </div>
                        <div className="chart-summary">
                          {money(mrr)}
                          <span>current MRR</span>
                        </div>
                        <RevenueChart value={mrr} />
                        <div className="chart-footer">
                          <span>
                            <span className="tiny-dot" />
                            Based on your active subscriptions
                          </span>
                          <button
                            className="text-button"
                            onClick={() => navigate("Payments")}
                          >
                            View payments <ArrowUpRight size={15} />
                          </button>
                        </div>
                      </section>
                      <section className="attention-panel">
                        <div className="attention-top">
                          <span className="eyebrow">A LITTLE ATTENTION</span>
                          <span className="attention-count">
                            {overdue.length}
                          </span>
                        </div>
                        <h2>
                          Keep the good
                          <br />
                          things flowing.
                        </h2>
                        <p>
                          {overdue.length
                            ? "A friendly follow-up today. A healthier cash flow tomorrow."
                            : "You’re all caught up. A good moment to look ahead."}
                        </p>
                        <div className="attention-list">
                          {overdue.slice(0, 2).map((i) => (
                            <button key={i.id} onClick={() => setInvoice(i)}>
                              <span className="overdue-icon">
                                <FileText size={16} />
                              </span>
                              <span>
                                <strong>{i.customer}</strong>
                                <small>{i.id} · Overdue</small>
                              </span>
                              <span>
                                {money(i.total)}
                                <ChevronRight size={14} />
                              </span>
                            </button>
                          ))}
                        </div>
                        <button
                          className="button attention-button"
                          onClick={() => {
                            navigate("Invoices");
                            setFilter("Overdue");
                          }}
                        >
                          Review outstanding invoices <ArrowRight size={16} />
                        </button>
                      </section>
                    </div>

                    {!customer && (
                      <div className="overview-dual-row">
                        <section className="panel">
                          <div className="panel-head">
                            <div>
                              <h2>Revenue by plan tier</h2>
                              <p>Recurring revenue contribution and seat allocation by plan.</p>
                            </div>
                            <button
                              className="text-button"
                              onClick={() => navigate("Products & plans")}
                            >
                              Manage plans <ArrowRight size={14} />
                            </button>
                          </div>
                          <div className="plan-dist-list">
                            {data.plans.map((p, idx) => {
                              const subsOnPlan = active.filter((s) => s.planId === p.id);
                              const seatsOnPlan = subsOnPlan.reduce((acc, s) => acc + s.seats, 0);
                              const revenueOnPlan = subsOnPlan.reduce(
                                (acc, s) =>
                                  acc +
                                  (p.price * s.seats * (1 - s.discount / 100)) /
                                    (p.cycle === "Yearly" ? 12 : 1),
                                0,
                              );
                              const percent = mrr > 0 ? Math.round((revenueOnPlan / mrr) * 100) : 0;
                              const colors = ["#0071e3", "#8b5cf6", "#10b981"];
                              return (
                                <div key={p.id} className="plan-dist-item">
                                  <div className="plan-dist-top">
                                    <strong>
                                      <span
                                        style={{
                                          width: 8,
                                          height: 8,
                                          borderRadius: "50%",
                                          background: colors[idx % colors.length],
                                          display: "inline-block",
                                        }}
                                      />
                                      {p.name}
                                      <span className="plan-dist-badge">
                                        ({subsOnPlan.length} subs · {seatsOnPlan} seats)
                                      </span>
                                    </strong>
                                    <div className="plan-dist-figures">
                                      <strong>{money(revenueOnPlan)}</strong>
                                      <span>/mo ({percent}%)</span>
                                    </div>
                                  </div>
                                  <div className="plan-dist-bar-track">
                                    <div
                                      className="plan-dist-bar-fill"
                                      style={{
                                        width: `${percent}%`,
                                        background: colors[idx % colors.length],
                                      }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <div className="plan-dist-footer">
                            <span>
                              Total footprint: <strong>{totalSeats} active seats</strong>
                            </span>
                            <span>
                              ARPU: <strong>{money(active.length ? Math.round(mrr / active.length) : 0)}</strong> /account
                            </span>
                          </div>
                        </section>

                        <section className="panel">
                          <div className="panel-head">
                            <div>
                              <h2>Cash flow & invoicing funnel</h2>
                              <p>Real-time lifecycle state from draft generation to settled funds.</p>
                            </div>
                            <button
                              className="text-button"
                              onClick={() => navigate("Invoices")}
                            >
                              All invoices <ArrowRight size={14} />
                            </button>
                          </div>
                          <div className="pipeline-content">
                            <div className="pipeline-meter" aria-label="Invoice volume distribution">
                              <div
                                className="pipeline-segment paid"
                                style={{
                                  width: `${invoiceFunnelTotal > 0 ? (paidTotal / invoiceFunnelTotal) * 100 : 0}%`,
                                }}
                                title={`Paid: ${money(paidTotal)}`}
                              />
                              <div
                                className="pipeline-segment confirmed"
                                style={{
                                  width: `${invoiceFunnelTotal > 0 ? (pendingTotal / invoiceFunnelTotal) * 100 : 0}%`,
                                }}
                                title={`Pending: ${money(pendingTotal)}`}
                              />
                              <div
                                className="pipeline-segment overdue"
                                style={{
                                  width: `${invoiceFunnelTotal > 0 ? (overdueTotal / invoiceFunnelTotal) * 100 : 0}%`,
                                }}
                                title={`Overdue: ${money(overdueTotal)}`}
                              />
                              <div
                                className="pipeline-segment draft"
                                style={{
                                  width: `${invoiceFunnelTotal > 0 ? (draftTotal / invoiceFunnelTotal) * 100 : 0}%`,
                                }}
                                title={`Draft: ${money(draftTotal)}`}
                              />
                            </div>

                            <div className="pipeline-stages-grid">
                              <div className="pipeline-stage-box">
                                <span className="pipeline-stage-title">
                                  <i style={{ background: "#9b9fa6" }} />
                                  Draft
                                </span>
                                <span className="pipeline-stage-amount">{money(draftTotal)}</span>
                                <span className="pipeline-stage-count">{draftInvoices.length} invoices</span>
                              </div>
                              <div className="pipeline-stage-box">
                                <span className="pipeline-stage-title">
                                  <i style={{ background: "#0071e3" }} />
                                  Pending
                                </span>
                                <span className="pipeline-stage-amount">{money(pendingTotal)}</span>
                                <span className="pipeline-stage-count">{pendingInvoices.length} awaiting due</span>
                              </div>
                              <div className="pipeline-stage-box">
                                <span className="pipeline-stage-title">
                                  <i style={{ background: "#f59e0b" }} />
                                  Overdue
                                </span>
                                <span className="pipeline-stage-amount" style={{ color: overdueTotal > 0 ? "#b45309" : undefined }}>
                                  {money(overdueTotal)}
                                </span>
                                <span className="pipeline-stage-count">{overdue.length} needs action</span>
                              </div>
                              <div className="pipeline-stage-box">
                                <span className="pipeline-stage-title">
                                  <i style={{ background: "#10b981" }} />
                                  Collected
                                </span>
                                <span className="pipeline-stage-amount">{money(paidTotal)}</span>
                                <span className="pipeline-stage-count">{paidInvoices.length} settled</span>
                              </div>
                            </div>

                            <div className="pipeline-efficiency-banner">
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <ShieldCheck size={18} />
                                <span>Collection Rate: {collectionRate}% · Healthy collection pace</span>
                              </div>
                              <button
                                className="text-button"
                                style={{ color: "inherit", fontWeight: 600, minHeight: "auto" }}
                                onClick={() => navigate("Payments")}
                              >
                                View ledger <ArrowRight size={14} />
                              </button>
                            </div>
                          </div>
                        </section>
                      </div>
                    )}

                    {!customer && (
                      <div className="overview-dual-row">
                        <section className="panel">
                          <div className="panel-head">
                            <div>
                              <h2>Upcoming renewals & billing</h2>
                              <p>Subscriptions approaching their next scheduled billing date.</p>
                            </div>
                            <button
                              className="text-button"
                              onClick={() => navigate("Subscriptions")}
                            >
                              Manage renewals <ArrowRight size={14} />
                            </button>
                          </div>
                          <div className="renewals-list">
                            {upcomingRenewals.map((s) => {
                              const p = data.plans.find((plan) => plan.id === s.planId)!;
                              const renewAmount = p.price * s.seats * (1 - s.discount / 100);
                              const d = new Date(s.next + "T12:00");
                              const formattedDate = d.toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                              });
                              return (
                                <div key={s.id} className="renewal-item">
                                  <div className="renewal-info">
                                    <span className="renewal-avatar">
                                      {s.customer.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                                    </span>
                                    <div className="renewal-meta">
                                      <strong>{s.customer}</strong>
                                      <span>
                                        <Calendar size={12} />
                                        Renews {formattedDate} · {p.name} ({s.seats} seats)
                                      </span>
                                    </div>
                                  </div>
                                  <div className="renewal-action">
                                    <div className="renewal-amount">
                                      {money(renewAmount)}
                                    </div>
                                    <button
                                      className="renewal-bill-btn"
                                      onClick={() => bill(s)}
                                      title="Draft recurring invoice immediately"
                                    >
                                      Bill now
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </section>

                        <section className="panel">
                          <div className="panel-head">
                            <div>
                              <h2>Recent financial activity</h2>
                              <p>Real-time audit stream of settlements, invoices, and notices.</p>
                            </div>
                            <button
                              className="text-button"
                              onClick={() => navigate("Payments")}
                            >
                              Audit trail <ArrowRight size={14} />
                            </button>
                          </div>
                          <div className="activity-feed-list">
                            {recentActivities.map((act) => (
                              <div
                                key={act.id}
                                className="activity-feed-item"
                                style={{ cursor: act.targetInvoice ? "pointer" : "default" }}
                                onClick={() => {
                                  if (act.targetInvoice) setInvoice(act.targetInvoice);
                                }}
                              >
                                <div className={`activity-icon-disc ${act.type}`}>
                                  {act.type === "payment" && <Wallet size={16} />}
                                  {act.type === "invoice" && <FileText size={16} />}
                                  {act.type === "overdue" && <AlertCircle size={16} />}
                                </div>
                                <div className="activity-body">
                                  <div className="activity-text">
                                    <strong>{act.title}</strong>
                                  </div>
                                  <div className="activity-time">
                                    {act.subtitle}
                                  </div>
                                </div>
                                <div className="activity-amount">
                                  {act.amount}
                                </div>
                              </div>
                            ))}
                          </div>
                        </section>
                      </div>
                    )}

                    <section className="panel subscription-panel">
                      <div className="panel-head">
                        <div>
                          <h2>
                            {customer
                              ? "Your subscriptions"
                              : "Recent subscriptions"}
                            <span className="count-pill">
                              {subscriptions.length}
                            </span>
                          </h2>
                          <p>
                            A comprehensive ledger of recurring relationships.
                          </p>
                        </div>
                        <button
                          className="text-button"
                          onClick={() => navigate("Subscriptions")}
                        >
                          View all subscriptions
                          <ArrowRight size={16} />
                        </button>
                      </div>
                      {subTable(subscriptions.slice(0, 5), true)}
                    </section>
                    <div className="bottom-note">
                      <span className="brand-mini">b.</span> Less managing. More
                      moving forward.
                      <span>All amounts in INR · Local demo data</span>
                    </div>
                  </>
                )}
                {page === "Subscriptions" && (
                  <section className="panel">
                    <div className="toolbar">
                      <div className="filter-tabs">
                        {[
                          "All",
                          "Active",
                          "Draft",
                          "Quotation",
                          "Paused",
                          "Closed",
                        ].map((f) => (
                          <button
                            className={filter === f ? "active" : ""}
                            key={f}
                            onClick={() => setFilter(f)}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                      <label className="search">
                        <Search size={16} />
                        <input
                          aria-label="Search subscriptions"
                          placeholder="Search subscriptions…"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                        />
                      </label>
                    </div>
                    {subTable(filteredSubs)}
                  </section>
                )}
                {page === "Products & plans" && (
                  <>
                    <div className="plans-grid">
                      {data.plans.map((p, i) => (
                        <motion.section
                          whileHover={{ y: -4 }}
                          transition={spring}
                          className={`plan-card ${i === 1 ? "recommended" : ""}`}
                          key={p.id}
                        >
                          <div className="plan-top">
                            <span className="plan-number">0{i + 1}</span>
                            {i === 1 && (
                              <span className="plan-tag">THE SWEET SPOT</span>
                            )}
                          </div>
                          <h2>{p.name}</h2>
                          <p>{p.description}</p>
                          <div className="plan-price">
                            {money(p.price)}
                            <span>
                              {" "}
                              / {p.cycle === "Monthly" ? "month" : "year"}
                            </span>
                          </div>
                          <span className="muted">per seat, before taxes</span>
                          <button
                            className={`button ${i === 1 ? "primary" : ""}`}
                            onClick={() => {
                              setPlanChoice(p.id);
                              setModal("new");
                            }}
                          >
                            {customer ? "Choose plan" : "Create subscription"}
                            <ArrowRight size={16} />
                          </button>
                          <div className="plan-features">
                            {p.features.map((f) => (
                              <div key={f}>
                                <Check size={16} />
                                {f}
                              </div>
                            ))}
                          </div>
                        </motion.section>
                      ))}
                    </div>
                    <div className="info-strip">
                      <Layers3 size={22} />
                      <div>
                        <strong>One workspace. A plan for every stage.</strong>
                        <p>
                          Monthly plans offer flexibility. Annual plans make
                          long-term planning simpler.
                        </p>
                      </div>
                    </div>
                  </>
                )}
                {page === "Invoices" && (
                  <section className="panel">
                    <div className="toolbar">
                      <div className="filter-tabs">
                        {[
                          "All",
                          "Draft",
                          "Confirmed",
                          "Paid",
                          "Overdue",
                          "Cancelled",
                        ].map((f) => (
                          <button
                            key={f}
                            className={filter === f ? "active" : ""}
                            onClick={() => setFilter(f)}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                      <label className="search">
                        <Search size={16} />
                        <input
                          aria-label="Search invoices"
                          placeholder="Search invoices…"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                        />
                      </label>
                    </div>
                    <div className="table-scroll">
                      <table>
                        <thead>
                          <tr>
                            <th>Invoice</th>
                            <th>Customer</th>
                            <th>Due date</th>
                            <th>Status</th>
                            <th className="text-right">Amount</th>
                            <th />
                          </tr>
                        </thead>
                        <tbody>
                          {invoices
                            .filter(
                              (i) =>
                                (filter === "All" ||
                                  i.status === filter ||
                                  (filter === "Overdue" &&
                                    i.status === "Confirmed" &&
                                    i.due < today())) &&
                                `${i.id} ${i.customer}`
                                  .toLowerCase()
                                  .includes(search.toLowerCase()),
                            )
                            .map((i) => (
                              <tr key={i.id}>
                                <td>
                                  <button
                                    className="text-button"
                                    onClick={() => setInvoice(i)}
                                  >
                                    {i.id}
                                  </button>
                                </td>
                                <td>{i.customer}</td>
                                <td>{i.due}</td>
                                <td>
                                  <Badge
                                    status={
                                      i.status === "Confirmed" &&
                                      i.due < today()
                                        ? "Overdue"
                                        : i.status
                                    }
                                  />
                                </td>
                                <td className="amount text-right">
                                  {money(i.total)}
                                </td>
                                <td>
                                  <button
                                    className="icon-button"
                                    aria-label={`Open ${i.id}`}
                                    onClick={() => setInvoice(i)}
                                  >
                                    <ChevronRight size={16} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                      {!invoices.some(
                        (i) =>
                          (filter === "All" ||
                            i.status === filter ||
                            (filter === "Overdue" &&
                              i.status === "Confirmed" &&
                              i.due < today())) &&
                          `${i.id} ${i.customer}`
                            .toLowerCase()
                            .includes(search.toLowerCase()),
                      ) && (
                        <div className="empty">
                          No invoices match this view.
                        </div>
                      )}
                    </div>
                  </section>
                )}
                {page === "Payments" && (
                  <section className="panel">
                    <div className="panel-head">
                      <div>
                        <h2>Payment history</h2>
                        <p>Reconciled with the right invoice.</p>
                      </div>
                      <span className="total-label">
                        {money(payments.reduce((a, p) => a + p.amount, 0))}{" "}
                        collected
                      </span>
                    </div>
                    <div className="table-scroll">
                      <table>
                        <thead>
                          <tr>
                            <th>Payment</th>
                            <th>Customer</th>
                            <th>Method</th>
                            <th>Date</th>
                            <th>Invoice</th>
                            <th className="text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payments.map((p) => (
                            <tr key={p.id}>
                              <td>
                                <span className="payment-id">
                                  <ArrowDownLeft size={17} />
                                  {p.id}
                                </span>
                              </td>
                              <td>{p.customer}</td>
                              <td>{p.method}</td>
                              <td>{p.date}</td>
                              <td>
                                <button
                                  className="text-button"
                                  onClick={() =>
                                    setInvoice(
                                      data.invoices.find(
                                        (i) => i.id === p.invoiceId,
                                      )!,
                                    )
                                  }
                                >
                                  {p.invoiceId}
                                </button>
                              </td>
                              <td className="amount text-right">
                                {money(p.amount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {!payments.length && (
                        <div className="empty">
                          Payments will appear here when an invoice is paid.
                        </div>
                      )}
                    </div>
                  </section>
                )}
                {page === "Customers" && (
                  <section className="panel">
                    <div className="toolbar">
                      <h2>Customer directory</h2>
                      <label className="search">
                        <Search size={16} />
                        <input
                          aria-label="Search customers"
                          placeholder="Find a customer…"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                        />
                      </label>
                    </div>
                    {subTable(
                      subscriptions.filter(
                        (s, i, a) =>
                          a.findIndex((x) => x.email === s.email) === i &&
                          s.customer
                            .toLowerCase()
                            .includes(search.toLowerCase()),
                      ),
                    )}
                  </section>
                )}
                {page === "Settings" && (
                  <div className="settings-grid">
                    <section className="panel settings-panel">
                      <h2>Workspace preferences</h2>
                      <p className="muted">A few details that make it yours.</p>
                      <div className="setting-row">
                        <div>
                          <strong>Dark appearance</strong>
                          <small>A quieter workspace after hours.</small>
                        </div>
                        <button
                          role="switch"
                          aria-checked={dark}
                          aria-label="Dark appearance"
                          className={`toggle ${dark ? "on" : ""}`}
                          onClick={() => setDark(!dark)}
                        >
                          <motion.span layout transition={spring} />
                        </button>
                      </div>
                      <div className="setting-row">
                        <div>
                          <strong>Currency</strong>
                          <small>Indian Rupee · INR (₹)</small>
                        </div>
                        <span>INR</span>
                      </div>
                      <div className="setting-row">
                        <div>
                          <strong>Preview access</strong>
                          <small>
                            Roles are simulated in this frontend demo.
                          </small>
                        </div>
                        <Badge status={role} />
                      </div>
                    </section>
                    {role === "Admin" && (
                      <section className="panel settings-panel">
                        <h2>Billing defaults</h2>
                        <p className="muted">
                          Applied to newly created records.
                        </p>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            const f = new FormData(e.currentTarget);
                            setData((d) => ({
                              ...d,
                              tax: Number(f.get("tax")),
                              discount: Number(f.get("discount")),
                            }));
                            notify("Billing defaults saved.");
                          }}
                        >
                          <Field label="Tax rate (%)">
                            <input
                              name="tax"
                              type="number"
                              min="0"
                              max="100"
                              required
                              defaultValue={data.tax}
                            />
                          </Field>
                          <Field label="Available seat discount (%)">
                            <input
                              name="discount"
                              type="number"
                              min="0"
                              max="100"
                              required
                              defaultValue={data.discount}
                            />
                          </Field>
                          <button className="button primary">
                            Save defaults
                          </button>
                        </form>
                      </section>
                    )}
                    {role === "Admin" && (
                      <section className="panel settings-panel">
                        <div className="panel-head">
                          <h2>Your team</h2>
                          <button
                            className="button"
                            onClick={() => setModal("staff")}
                          >
                            <Plus size={16} />
                            Add staff
                          </button>
                        </div>
                        {data.staff.map((name, i) => (
                          <div className="setting-row" key={i}>
                            <strong>{name}</strong>
                            <span className="muted">Staff</span>
                          </div>
                        ))}
                      </section>
                    )}
                    <section className="panel settings-panel">
                      <h2>About this demo</h2>
                      <p className="muted">
                        Changes are saved in this browser. Payments, account
                        access, and billing are demonstrations; no money is
                        charged and no emails are sent.
                      </p>
                      <button
                        className="button"
                        onClick={() => setModal("account")}
                      >
                        Explore account screens <ArrowUpRight size={16} />
                      </button>
                    </section>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
        {modal === "new" && (
          <Modal
            title={
              customer
                ? "Make room for what’s next."
                : "A new relationship starts here."
            }
            subtitle="Choose a plan. We’ll take care of the numbers."
            onClose={() => setModal(null)}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitSubscription(e.currentTarget);
              }}
            >
              {!customer && (
                <div className="form-grid">
                  <Field label="Customer name">
                    <input
                      name="customer"
                      required
                      placeholder="e.g. Forma Design"
                      maxLength={80}
                    />
                  </Field>
                  <Field label="Billing email">
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="billing@company.com"
                    />
                  </Field>
                </div>
              )}
              <Field label="Subscription plan">
                <select name="plan" defaultValue={planChoice}>
                  {data.plans.map((p) => (
                    <option value={p.id} key={p.id}>
                      {p.name} — {money(p.price)} / {p.cycle.toLowerCase()}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="form-grid">
                <Field label="Seats">
                  <input
                    name="seats"
                    type="number"
                    min="1"
                    max="10000"
                    defaultValue="1"
                    required
                  />
                </Field>
                <Field label="Start date">
                  <input
                    name="start"
                    type="date"
                    defaultValue={today()}
                    required
                  />
                </Field>
              </div>
              {!customer && (
                <Field label="Seat discount">
                  <select name="discount">
                    <option value="0">No discount</option>
                    <option value={data.discount}>
                      {data.discount}% approved discount
                    </option>
                  </select>
                </Field>
              )}
              <div className="form-note">
                {data.tax}% tax applies on invoices.{" "}
                {customer
                  ? "No payment is collected in this demo."
                  : "Subscriptions begin as a draft for your review."}
              </div>
              <button className="button primary full">
                {customer ? "Start subscription" : "Create draft subscription"}
                <ArrowRight size={16} />
              </button>
            </form>
          </Modal>
        )}
        {selected && (
          <Modal
            title={selected.customer}
            subtitle={`${selected.id} · ${selected.email}`}
            onClose={() => setSelected(null)}
          >
            <div className="detail-status">
              <Badge status={selected.status} />
              <span>
                {data.plans.find((p) => p.id === selected.planId)?.name} plan
              </span>
            </div>
            <div className="detail-grid">
              <div>
                <small>Seats</small>
                <strong>{selected.seats}</strong>
              </div>
              <div>
                <small>Next billing</small>
                <strong>{selected.next}</strong>
              </div>
              <div>
                <small>Start date</small>
                <strong>{selected.start}</strong>
              </div>
              <div>
                <small>Discount</small>
                <strong>{selected.discount}%</strong>
              </div>
            </div>
            <div className="lifecycle">
              {["Draft", "Quotation", "Confirmed", "Active"].map((s, i) => (
                <span
                  className={
                    ["Draft", "Quotation", "Confirmed", "Active"].indexOf(
                      selected.status,
                    ) >= i
                      ? "done"
                      : ""
                  }
                  key={s}
                >
                  <Check size={13} />
                  {s}
                </span>
              ))}
            </div>
            <div className="action-row">
              {!customer && selected.status === "Draft" && (
                <button
                  className="button primary"
                  onClick={() => updateSub(selected, "Quotation")}
                >
                  Create quotation
                  <ArrowRight size={16} />
                </button>
              )}
              {!customer && selected.status === "Quotation" && (
                <button
                  className="button primary"
                  onClick={() => updateSub(selected, "Confirmed")}
                >
                  Confirm subscription
                </button>
              )}
              {!customer && selected.status === "Confirmed" && (
                <button
                  className="button primary"
                  onClick={() => updateSub(selected, "Active")}
                >
                  Activate subscription
                </button>
              )}
              {selected.status === "Active" && (
                <>
                  {!customer && (
                    <button
                      className="button primary"
                      onClick={() => bill(selected)}
                    >
                      Generate invoice
                    </button>
                  )}
                  <button
                    className="button"
                    onClick={() => updateSub(selected, "Paused")}
                  >
                    Pause subscription
                  </button>
                </>
              )}
              {selected.status === "Paused" && (
                <button
                  className="button primary"
                  onClick={() => updateSub(selected, "Active")}
                >
                  Resume subscription
                </button>
              )}
              {selected.status === "Closed" && (
                <button
                  className="button primary"
                  onClick={() => {
                    const renewed = {
                      ...selected,
                      next: nextDate(
                        today(),
                        data.plans.find((p) => p.id === selected.planId)!.cycle,
                      ),
                    };
                    updateSub(renewed, "Active");
                  }}
                >
                  Renew subscription
                </button>
              )}
              {selected.status !== "Closed" && (
                <button
                  className="button subtle"
                  onClick={() => updateSub(selected, "Closed")}
                >
                  Close subscription
                </button>
              )}
            </div>
          </Modal>
        )}
        {invoice && !modal && (
          <Modal
            title={invoice.id}
            subtitle={`${invoice.customer} · Due ${invoice.due}`}
            onClose={() => setInvoice(null)}
          >
            <div className="detail-status">
              <Badge status={invoice.status} />
              <button className="text-button" onClick={() => window.print()}>
                Print invoice <Download size={16} />
              </button>
            </div>
            <div className="invoice-lines">
              <div>
                <span>Subscription</span>
                <strong>{invoice.subscriptionId}</strong>
              </div>
              <div>
                <span>Billing period</span>
                <strong>{invoice.period}</strong>
              </div>
              <div>
                <span>Subtotal</span>
                <strong>{money(invoice.subtotal)}</strong>
              </div>
              <div>
                <span>Discount</span>
                <strong>− {money(invoice.discount)}</strong>
              </div>
              <div>
                <span>Tax</span>
                <strong>{money(invoice.tax)}</strong>
              </div>
              <div className="invoice-total">
                <span>Total due</span>
                <strong>{money(invoice.total)}</strong>
              </div>
            </div>
            <div className="action-row">
              {invoice.status === "Draft" && !customer && (
                <button
                  className="button primary"
                  onClick={() => updateInvoice(invoice, "Confirmed")}
                >
                  Confirm invoice
                </button>
              )}
              {invoice.status === "Confirmed" && (
                <button
                  className="button primary"
                  onClick={() => setModal("payment")}
                >
                  {customer ? "Pay invoice (demo)" : "Record payment"}
                </button>
              )}
              {["Draft", "Confirmed"].includes(invoice.status) && !customer && (
                <button
                  className="button"
                  onClick={() => updateInvoice(invoice, "Cancelled")}
                >
                  Cancel invoice
                </button>
              )}
              {invoice.status === "Paid" && (
                <p className="paid-note">
                  <Check size={18} /> Paid in full. All accounted for.
                </p>
              )}
            </div>
          </Modal>
        )}
        {modal === "payment" && invoice && (
          <Modal
            title="One more thing, accounted for."
            subtitle={`${invoice.id} · ${money(invoice.total)} outstanding`}
            onClose={() => setModal(null)}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                setData((d) => {
                  if (
                    d.invoices.find((i) => i.id === invoice.id)?.status !==
                    "Confirmed"
                  )
                    return d;
                  return {
                    ...d,
                    subscriptions: d.subscriptions.map((s) =>
                      s.id === invoice.subscriptionId &&
                      s.next === invoice.period
                        ? {
                            ...s,
                            next: nextDate(
                              s.next,
                              d.plans.find((p) => p.id === s.planId)!.cycle,
                            ),
                          }
                        : s,
                    ),
                    invoices: d.invoices.map((i) =>
                      i.id === invoice.id ? { ...i, status: "Paid" } : i,
                    ),
                    payments: [
                      {
                        id: `PAY-${Date.now().toString().slice(-6)}`,
                        invoiceId: invoice.id,
                        customer: invoice.customer,
                        amount: invoice.total,
                        date: String(f.get("date")),
                        method: String(f.get("method")),
                        note: String(f.get("note")),
                      },
                      ...d.payments,
                    ],
                  };
                });
                setInvoice({ ...invoice, status: "Paid" });
                setModal(null);
                notify("Payment recorded. Your overview is up to date.");
              }}
            >
              <Field label="Payment method">
                <select name="method">
                  <option>Bank transfer</option>
                  <option>UPI</option>
                  <option>Card</option>
                </select>
              </Field>
              <Field label="Payment date">
                <input
                  type="date"
                  name="date"
                  defaultValue={today()}
                  max={today()}
                  required
                />
              </Field>
              <Field label="Reference or note">
                <input
                  name="note"
                  placeholder="Transaction reference (optional)"
                />
              </Field>
              <div className="form-note">
                Full payment of {money(invoice.total)}. This is a demonstration;
                no money will move.
              </div>
              <button className="button primary full">
                Record payment
                <Check size={16} />
              </button>
            </form>
          </Modal>
        )}
        {modal === "plan" && role === "Admin" && (
          <Modal title="A plan for what’s next." onClose={() => setModal(null)}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                setData((d) => ({
                  ...d,
                  plans: [
                    ...d.plans,
                    {
                      id: `plan-${Date.now()}`,
                      name: String(f.get("name")),
                      price: Number(f.get("price")),
                      cycle: String(f.get("cycle")) as "Monthly" | "Yearly",
                      description: String(f.get("description")),
                      features: [
                        "Business workspace",
                        "Team collaboration",
                        "Email support",
                      ],
                    },
                  ],
                }));
                setModal(null);
                notify("Plan created. Ready for a new subscription.");
              }}
            >
              <Field label="Plan name">
                <input name="name" required maxLength={40} />
              </Field>
              <Field label="Short description">
                <input name="description" required maxLength={100} />
              </Field>
              <div className="form-grid">
                <Field label="Price per seat (INR)">
                  <input name="price" type="number" min="1" required />
                </Field>
                <Field label="Billing cycle">
                  <select name="cycle">
                    <option>Monthly</option>
                    <option>Yearly</option>
                  </select>
                </Field>
              </div>
              <button className="button primary full">Create plan</button>
            </form>
          </Modal>
        )}
        {modal === "staff" && role === "Admin" && (
          <Modal
            title="Good work takes a team."
            subtitle="Add a staff member to this demo workspace."
            onClose={() => setModal(null)}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                setData((d) => ({
                  ...d,
                  staff: [...d.staff, String(f.get("name"))],
                }));
                setModal(null);
                notify("Staff member added to the demo workspace.");
              }}
            >
              <Field label="Full name">
                <input name="name" required maxLength={60} />
              </Field>
              <button className="button primary full">Add staff member</button>
            </form>
          </Modal>
        )}
        {modal === "account" && (
          <Modal
            title={
              accountMode === "signup"
                ? "A fresh start."
                : accountMode === "reset"
                  ? "Let’s get you back in."
                  : "Welcome back."
            }
            subtitle="Account screen preview. Authentication requires a backend."
            onClose={() => setModal(null)}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                notify(
                  accountMode === "reset"
                    ? "Reset preview complete. No email was sent."
                    : "Account preview complete. You’re in the demo workspace.",
                );
                setModal(null);
              }}
            >
              <Field label="Email address">
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                />
              </Field>
              {accountMode !== "reset" && (
                <Field label="Password">
                  <input
                    type="password"
                    autoComplete={
                      accountMode === "signup"
                        ? "new-password"
                        : "current-password"
                    }
                    required
                    minLength={9}
                    pattern={
                      accountMode === "signup"
                        ? "(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{9,}"
                        : undefined
                    }
                  />
                </Field>
              )}
              {accountMode === "signup" && (
                <p className="form-note">
                  At least 9 characters, including uppercase, lowercase, and a
                  special character.
                </p>
              )}
              <button className="button primary full">
                {accountMode === "signup"
                  ? "Preview signup"
                  : accountMode === "reset"
                    ? "Preview reset"
                    : "Enter demo"}
              </button>
            </form>
            <div className="account-links">
              <button
                className="text-button"
                onClick={() =>
                  setAccountMode(accountMode === "signup" ? "login" : "signup")
                }
              >
                {accountMode === "signup"
                  ? "Already have an account?"
                  : "Create an account"}
              </button>
              <button
                className="text-button"
                onClick={() => setAccountMode("reset")}
              >
                Forgot password?
              </button>
            </div>
          </Modal>
        )}
        <WelcomeModal
          isOpen={showWelcome}
          onClose={() => {
            setShowWelcome(false);
            try {
              localStorage.setItem("brightloop-welcome-seen", "true");
            } catch {}
          }}
        />
        <AnimatePresence>
          {toast && (
            <motion.div
              role="status"
              className="toast"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <Check size={17} />
              {toast}
              <button
                className="icon-button"
                aria-label="Dismiss notification"
                onClick={() => setToast("")}
              >
                <X size={15} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
function Metric({
  label,
  value,
  detail,
  featured,
  warning,
  badge,
}: {
  label: string;
  value: string;
  detail: string;
  featured?: boolean;
  warning?: boolean;
  badge?: string;
}) {
  return (
    <div className={`metric ${featured ? "featured" : ""}`}>
      <span className="metric-label">
        {label}
        {badge && (
          <span className={`overview-badge-trend ${featured ? "" : "neutral"}`}>
            {featured && <TrendingUp size={11} />}
            {badge}
          </span>
        )}
        {!badge && featured && <ArrowUpRight size={15} />}
      </span>
      <strong>{value}</strong>
      <span className={`metric-detail ${warning ? "warning" : ""}`}>
        <i />
        {detail}
      </span>
    </div>
  );
}
function RevenueChart({ value }: { value: number }) {
  return (
    <div className="revenue-chart">
      <div className="chart-y">
        {[1.5, 1, 0.5, 0].map((n) => (
          <span key={n}>{money(value * n)}</span>
        ))}
      </div>
      <div className="chart-plot">
        <div className="chart-grid">
          <i />
          <i />
          <i />
          <i />
        </div>
        <svg
          viewBox="0 0 700 190"
          preserveAspectRatio="none"
          role="img"
          aria-label="Illustrative recurring revenue trend; current value is calculated from active subscriptions"
        >
          <defs>
            <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0071e3" stopOpacity=".16" />
              <stop offset="100%" stopColor="#0071e3" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0 153 C35 153 35 134 70 135 S118 150 145 123 S184 140 219 114 S260 124 290 99 S334 105 365 89 S409 105 438 71 S481 86 510 65 S551 73 584 43 S625 48 653 34 S682 38 700 24 L700 190 L0 190Z"
            fill="url(#chart-fill)"
          />
          <path
            d="M0 153 C35 153 35 134 70 135 S118 150 145 123 S184 140 219 114 S260 124 290 99 S334 105 365 89 S409 105 438 71 S481 86 510 65 S551 73 584 43 S625 48 653 34 S682 38 700 24"
            fill="none"
            stroke="#0071e3"
            strokeWidth="2.5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <div className="chart-x">
          <span>01 Oct</span>
          <span>06 Oct</span>
          <span>11 Oct</span>
          <span>16 Oct</span>
          <span>21 Oct</span>
          <span>26 Oct</span>
          <span>31 Oct</span>
        </div>
      </div>
      <span className="chart-demo">Illustrative trend · Oct 2026</span>
    </div>
  );
}
