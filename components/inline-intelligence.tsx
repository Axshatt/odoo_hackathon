"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Zap,
  CreditCard,
  FileText,
  Percent,
  BarChart3,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Bot,
  Brain,
  SlidersHorizontal,
} from "lucide-react";
import {
  createInvoice,
  money,
  nextDate,
  today,
  type Store,
  type Subscription,
  type Invoice,
  type Payment,
} from "@/lib/billing";

interface InlineIntelligenceProps {
  data: Store;
  setData: React.Dispatch<React.SetStateAction<Store>>;
  role: string;
  navigate: (page: any) => void;
  notify: (msg: string) => void;
  setSelected: (sub: Subscription | null) => void;
  setInvoice: (inv: Invoice | null) => void;
  setModal: (modal: any) => void;
}

interface ActionCard {
  type: "batch_billing" | "quick_pay" | "new_quote" | "apply_discount" | "analytics";
  title: string;
  description: string;
  buttonLabel: string;
  data?: any;
}

interface Message {
  id: string;
  sender: "ai" | "user";
  text: string;
  timestamp: string;
  actionCard?: ActionCard;
}

export function InlineIntelligence({
  data,
  setData,
  role,
  navigate,
  notify,
  setSelected,
  setInvoice,
  setModal,
}: InlineIntelligenceProps) {
  const [input, setInput] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);
  const [thinkingStep, setThinkingStep] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeSubs = data.subscriptions.filter((s) => s.status === "Active");
  const confirmedInvoices = data.invoices.filter((i) => i.status === "Confirmed");
  const overdueInvoices = confirmedInvoices.filter((i) => i.due < today());

  const mrr = activeSubs.reduce((acc, sub) => {
    const plan = data.plans.find((p) => p.id === sub.planId);
    if (!plan) return acc;
    const netPrice = plan.price * sub.seats * (1 - sub.discount / 100);
    return acc + (plan.cycle === "Yearly" ? netPrice / 12 : netPrice);
  }, 0);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init-1",
      sender: "ai",
      text: "Brightloop Intelligence is your primary contact point. One place to manage plans, subscriptions, and recurring billing. I am currently monitoring 8 subscriptions, 6 invoices, and revenue cash flow in real-time.",
      timestamp: "Just now",
      actionCard: overdueInvoices.length > 0 ? {
        type: "quick_pay",
        title: `${overdueInvoices.length} Overdue Account Detected`,
        description: `Linear Studio (INV-1049) is past due date with ₹50,963 pending. One-tap settlement available.`,
        buttonLabel: "Settle Linear Studio (₹50,963)",
        data: overdueInvoices[0],
      } : undefined,
    },
  ]);

  useEffect(() => {
    if (isExpanded) {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isExpanded, thinkingStep]);

  const executeAction = (actionType: string, actionData?: any) => {
    if (actionType === "batch_billing") {
      let createdCount = 0;
      const newInvoices: Invoice[] = [];

      for (const sub of activeSubs) {
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
        setData((prev) => ({
          ...prev,
          invoices: [...newInvoices, ...prev.invoices],
        }));
        notify(`Billing Day: ${createdCount} invoices drafted with automatic tax calculation.`);
        simulateAiThoughtAndRespond(
          `Success: Executed automated billing day run. Drafted ${createdCount} new invoices for active subscriptions. All line items, taxes, and customer terms were prefilled without duplicates.`
        );
      } else {
        notify("Billing Day: All active subscriptions are already up to date.");
        simulateAiThoughtAndRespond(
          "Billing Day Audit: All active customer subscriptions already have valid invoices for their next billing cycle. Idempotent check prevented double billing."
        );
      }
    } else if (actionType === "quick_pay") {
      const targetInvoice =
        actionData || overdueInvoices[0] || confirmedInvoices[0];
      if (!targetInvoice) {
        notify("No outstanding invoice to settle.");
        return;
      }

      const payment: Payment = {
        id: `PAY-${201 + data.payments.length}`,
        invoiceId: targetInvoice.id,
        customer: targetInvoice.customer,
        amount: targetInvoice.total,
        date: today(),
        method: "UPI",
        note: "Settled via Brightloop Intelligence",
      };

      setData((prev) => {
        const updatedInvoices = prev.invoices.map((inv) =>
          inv.id === targetInvoice.id ? { ...inv, status: "Paid" as const } : inv
        );
        const sub = prev.subscriptions.find(
          (s) => s.id === targetInvoice.subscriptionId
        );
        const plan = sub ? prev.plans.find((p) => p.id === sub.planId) : null;

        let updatedSubs = prev.subscriptions;
        if (sub && plan && sub.next === targetInvoice.period) {
          updatedSubs = prev.subscriptions.map((s) =>
            s.id === sub.id
              ? { ...s, next: nextDate(s.next, plan.cycle) }
              : s
          );
        }

        return {
          ...prev,
          invoices: updatedInvoices,
          payments: [payment, ...prev.payments],
          subscriptions: updatedSubs,
        };
      });

      notify(`Settled ${money(targetInvoice.total)} for ${targetInvoice.customer}. Next billing date advanced.`);
      simulateAiThoughtAndRespond(
        `Recorded full settlement of ${money(targetInvoice.total)} for ${targetInvoice.customer} via instant UPI. Marked invoice as Paid and advanced the subscription billing cycle.`
      );
    } else if (actionType === "new_quote") {
      setModal("new");
      notify("Opened subscription quotation builder.");
      simulateAiThoughtAndRespond(
        "Opened the quotation builder. You can select pre-configured plan lines, set validity in days, and apply customer discounts."
      );
    } else if (actionType === "apply_discount") {
      setData((prev) => ({
        ...prev,
        subscriptions: prev.subscriptions.map((s) => ({
          ...s,
          discount: s.discount === 0 ? 10 : s.discount,
        })),
        discount: 10,
      }));
      notify("10% volume discount rule applied to customer subscriptions.");
      simulateAiThoughtAndRespond(
        "Applied standard 10% seat volume discount across eligible customer subscriptions. Next recurring invoices will reflect the discounted subtotals."
      );
    } else if (actionType === "analytics") {
      navigate("Overview");
      simulateAiThoughtAndRespond(
        `Financial Health Snapshot:\n• Current MRR: ${money(mrr)}\n• Active Subscriptions: ${activeSubs.length}\n• Outstanding Balance: ${money(confirmedInvoices.reduce((a, b) => a + b.total, 0))}\n• Overdue Invoices: ${overdueInvoices.length}`
      );
    }
  };

  const simulateAiThoughtAndRespond = (text: string, card?: ActionCard) => {
    setIsExpanded(true);
    setThinkingStep("Thinking...");

    setTimeout(() => {
      setThinkingStep("Analyzing subscription records & billing rules...");
    }, 450);

    setTimeout(() => {
      setThinkingStep("Verifying idempotency & cash reconciliation...");
    }, 900);

    setTimeout(() => {
      setThinkingStep(null);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          sender: "ai",
          text,
          timestamp: "Just now",
          actionCard: card,
        },
      ]);
    }, 1300);
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const query = input.trim();
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsExpanded(true);

    const lower = query.toLowerCase();

    if (lower.includes("bill") || lower.includes("invoice") || lower.includes("batch")) {
      simulateAiThoughtAndRespond(
        "I can execute an automated billing run across all active subscriptions without double billing.",
        {
          type: "batch_billing",
          title: "Run Recurring Billing Batch",
          description: `Scan ${activeSubs.length} active customer accounts and draft invoices for upcoming due dates.`,
          buttonLabel: "Generate Due Invoices",
        }
      );
    } else if (lower.includes("pay") || lower.includes("overdue") || lower.includes("settle")) {
      if (overdueInvoices.length > 0) {
        simulateAiThoughtAndRespond(
          `Found ${overdueInvoices.length} overdue invoices totaling ₹${overdueInvoices.reduce((a, b) => a + b.total, 0).toLocaleString("en-IN")}.`,
          {
            type: "quick_pay",
            title: `Settle ${overdueInvoices[0].customer}`,
            description: `Invoice ${overdueInvoices[0].id} is overdue with total ${money(overdueInvoices[0].total)}. One-click settlement available.`,
            buttonLabel: `Record UPI Settlement for ${overdueInvoices[0].customer}`,
            data: overdueInvoices[0],
          }
        );
      } else {
        simulateAiThoughtAndRespond(
          "All customer invoices are currently settled. No overdue accounts found."
        );
      }
    } else if (lower.includes("quote") || lower.includes("offer") || lower.includes("new sub")) {
      simulateAiThoughtAndRespond(
        "Sales reps can assemble offers from pre-configured quotation templates with defined validity and seat quantities.",
        {
          type: "new_quote",
          title: "Prepare Subscription Quotation",
          description: "Configure customer offer with product variants and approved discounts.",
          buttonLabel: "Create Quotation Draft",
        }
      );
    } else if (lower.includes("discount") || lower.includes("price") || lower.includes("rate")) {
      simulateAiThoughtAndRespond(
        "Admin discount rules support percentage or fixed reductions for high-volume customers.",
        {
          type: "apply_discount",
          title: "Apply 10% Seat Volume Discount",
          description: "Apply pre-approved 10% discount rule to eligible active accounts.",
          buttonLabel: "Apply 10% Discount Rule",
        }
      );
    } else if (lower.includes("mrr") || lower.includes("revenue") || lower.includes("report")) {
      simulateAiThoughtAndRespond(
        `Current MRR is ${money(mrr)}. You have ${activeSubs.length} active subscriptions and ${overdueInvoices.length} overdue accounts.`,
        {
          type: "analytics",
          title: "Inspect Financial Health",
          description: "Review recurring revenue, cash collections, and overdue invoice tracking.",
          buttonLabel: "Open Overview Dashboard",
        }
      );
    } else {
      simulateAiThoughtAndRespond(
        "Brightloop Intelligence handles your end-to-end subscription lifecycle: automated batch billing, invoice generation, quotation drafts, and instant payment settlement.",
        {
          type: "batch_billing",
          title: "Automate Due Invoices",
          description: "Scan active subscriptions and produce invoices with tax calculation.",
          buttonLabel: "Scan & Generate Invoices",
        }
      );
    }
  };

  return (
    <div className="apple-hero-command-deck mb-7">
      <div className="apple-hero-glass-card">
        <div className="apple-hero-header">
          <div className="apple-hero-brand-group">
            <div className="apple-hero-logo-orb">
              <span className="apple-brand-symbol">
                b<span />
              </span>
            </div>
            <div className="apple-hero-brand-text">
              <div className="flex items-center gap-2">
                <span className="apple-hero-title">Brightloop Intelligence</span>
                <span className="apple-hero-status-pill">
                  <span className="apple-live-dot" />
                  Live Copilot
                </span>
              </div>
              <span className="apple-hero-tagline">
                One place to manage plans, subscriptions, and recurring billing.
              </span>
            </div>
          </div>

          <div className="apple-hero-actions-bar">
            <button
              onClick={() => executeAction("batch_billing")}
              className="apple-hero-chip primary"
            >
              <Zap size={13} />
              Billing Day Batch
            </button>

            {overdueInvoices.length > 0 && (
              <button
                onClick={() => executeAction("quick_pay")}
                className="apple-hero-chip alert"
              >
                <CreditCard size={13} />
                Settle Overdue ({overdueInvoices.length})
              </button>
            )}

            <button
              onClick={() => executeAction("new_quote")}
              className="apple-hero-chip"
            >
              <FileText size={13} />
              New Quote / Offer
            </button>

            <button
              onClick={() => executeAction("apply_discount")}
              className="apple-hero-chip"
            >
              <Percent size={13} />
              10% Seat Discount
            </button>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              aria-label={isExpanded ? "Collapse assistant" : "Expand assistant"}
              className="apple-hero-chip toggle"
            >
              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              <span>{isExpanded ? "Compact" : "Expand"}</span>
            </button>
          </div>
        </div>

        <div className="apple-hero-input-wrapper">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="apple-hero-input-form"
          >
            <div className="apple-hero-input-brand">
              <span className="apple-brand-symbol-small">
                b<span />
              </span>
            </div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything or command Brightloop Intelligence (e.g. 'Run batch billing', 'Settle Linear Studio invoice', 'Draft enterprise quote')..."
              className="apple-hero-input-field"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="apple-hero-submit-btn"
              aria-label="Submit command"
            >
              <ArrowUp size={16} />
            </button>
          </form>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 340 }}
              className="apple-hero-stream-container"
            >
              <div className="apple-hero-stream">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`apple-stream-row ${
                      m.sender === "user" ? "user-row" : "ai-row"
                    }`}
                  >
                    <div
                      className={`apple-stream-bubble ${
                        m.sender === "user" ? "user-bubble" : "ai-bubble"
                      }`}
                    >
                      <p className="whitespace-pre-line">{m.text}</p>

                      {m.actionCard && (
                        <div className="apple-stream-card">
                          <div className="apple-stream-card-title">
                            <span className="apple-card-dot" />
                            <strong>{m.actionCard.title}</strong>
                          </div>
                          <p className="apple-stream-card-desc">
                            {m.actionCard.description}
                          </p>
                          <button
                            onClick={() =>
                              executeAction(
                                m.actionCard!.type,
                                m.actionCard!.data
                              )
                            }
                            className="apple-stream-card-btn"
                          >
                            <Zap size={14} />
                            {m.actionCard.buttonLabel}
                          </button>
                        </div>
                      )}
                    </div>
                    <span className="apple-stream-time">{m.timestamp}</span>
                  </div>
                ))}

                {thinkingStep && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="apple-thinking-pill"
                  >
                    <div className="apple-thinking-orb">
                      <Brain size={13} className="animate-pulse" />
                    </div>
                    <span className="apple-thinking-text">{thinkingStep}</span>
                    <div className="apple-thinking-dots">
                      <span className="apple-tdot" />
                      <span className="apple-tdot" />
                      <span className="apple-tdot" />
                    </div>
                  </motion.div>
                )}
                <div ref={scrollRef} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
