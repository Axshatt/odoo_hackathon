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
  Plus,
  Brain,
  RotateCcw,
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

interface IntelligencePageProps {
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

export function IntelligencePage({
  data,
  setData,
  role,
  navigate,
  notify,
  setSelected,
  setInvoice,
  setModal,
}: IntelligencePageProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
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

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinkingStep]);

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
    setThinkingStep("Thinking...");

    setTimeout(() => {
      setThinkingStep("Analyzing subscription records & billing rules...");
    }, 400);

    setTimeout(() => {
      setThinkingStep("Verifying idempotency & cash reconciliation...");
    }, 850);

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
    }, 1250);
  };

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

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

  const handleClear = () => {
    setMessages([]);
    setThinkingStep(null);
  };

  return (
    <div className="apple-chat-fullscreen-wrapper">
      <div className="apple-chat-nav-header">
        <div className="flex items-center gap-2.5">
          <div className="apple-chat-orb-header">
            <span className="brand-symbol-small">
              b<span />
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[14px] text-neutral-900 dark:text-white">
              Brightloop Intelligence
            </span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Live Copilot
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right text-[11px] text-neutral-500 dark:text-neutral-400 hidden sm:block">
            <span>MRR: <strong>{money(mrr)}</strong></span> · <span>Active: <strong>{activeSubs.length}</strong></span>
          </div>
          {messages.length > 0 && (
            <button
              onClick={handleClear}
              className="apple-chat-nav-btn"
              title="New Chat"
            >
              <RotateCcw size={13} />
              <span>New chat</span>
            </button>
          )}
        </div>
      </div>

      <div className="apple-chat-body-scrollable">
        {messages.length === 0 ? (
          <div className="apple-chat-empty-hero">
            <div className="apple-chat-hero-symbol">
              <span className="brand-symbol">
                b<span />
              </span>
            </div>
            <h1 className="apple-chat-hero-title">What can I help with?</h1>
            <p className="apple-chat-hero-sub">
              One place to manage plans, subscriptions, and recurring billing.
            </p>
          </div>
        ) : (
          <div className="apple-chat-stream-column">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`apple-chat-row ${
                  m.sender === "user" ? "user-side" : "ai-side"
                }`}
              >
                {m.sender === "ai" && (
                  <div className="apple-chat-avatar-disc">
                    <span className="brand-symbol-small">
                      b<span />
                    </span>
                  </div>
                )}

                <div className="apple-chat-bubble-wrap">
                  <div
                    className={`apple-chat-speech-bubble ${
                      m.sender === "user" ? "user-bubble" : "ai-bubble"
                    }`}
                  >
                    <p className="whitespace-pre-line leading-relaxed">{m.text}</p>

                    {m.actionCard && (
                      <div className="apple-chat-action-box">
                        <div className="flex items-center gap-1.5 text-[12px] font-semibold text-neutral-900 dark:text-white">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3]" />
                          {m.actionCard.title}
                        </div>
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 mb-2.5">
                          {m.actionCard.description}
                        </p>
                        <button
                          onClick={() =>
                            executeAction(
                              m.actionCard!.type,
                              m.actionCard!.data
                            )
                          }
                          className="apple-chat-action-button"
                        >
                          <Zap size={13} />
                          {m.actionCard.buttonLabel}
                        </button>
                      </div>
                    )}
                  </div>
                  <span className="apple-chat-timestamp">{m.timestamp}</span>
                </div>
              </div>
            ))}

            {thinkingStep && (
              <div className="apple-chat-row ai-side">
                <div className="apple-chat-avatar-disc">
                  <span className="brand-symbol-small">
                    b<span />
                  </span>
                </div>
                <div className="apple-chat-thinking-bubble">
                  <Brain size={14} className="text-[#8b5cf6] animate-pulse" />
                  <span>{thinkingStep}</span>
                  <div className="flex items-center gap-1 ml-1">
                    <span className="w-1 h-1 rounded-full bg-[#8b5cf6] animate-bounce" />
                    <span className="w-1 h-1 rounded-full bg-[#8b5cf6] animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1 h-1 rounded-full bg-[#8b5cf6] animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        )}
      </div>

      <div className="apple-chat-fixed-footer">
        <div className="apple-chat-suggestions-carousel">
          <button
            onClick={() => handleSend("Run billing day batch for all due subscriptions")}
            className="apple-chat-pill-chip"
          >
            <Zap size={12} className="text-[#0071e3]" />
            Billing Day Batch
          </button>

          {overdueInvoices.length > 0 && (
            <button
              onClick={() => handleSend("Settle overdue invoices")}
              className="apple-chat-pill-chip alert"
            >
              <CreditCard size={12} className="text-[#ef4444]" />
              Settle Overdue ({overdueInvoices.length})
            </button>
          )}

          <button
            onClick={() => handleSend("Prepare a new subscription quotation")}
            className="apple-chat-pill-chip"
          >
            <FileText size={12} className="text-[#8b5cf6]" />
            New Quotation / Offer
          </button>

          <button
            onClick={() => handleSend("Apply 10% volume seat discount")}
            className="apple-chat-pill-chip"
          >
            <Percent size={12} className="text-[#f59e0b]" />
            10% Seat Discount
          </button>

          <button
            onClick={() => handleSend("Show monthly recurring revenue snapshot")}
            className="apple-chat-pill-chip"
          >
            <BarChart3 size={12} className="text-[#10b981]" />
            MRR Report
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="apple-chat-interactive-input"
        >
          <button
            type="button"
            onClick={() => handleSend("Show available subscription commands")}
            className="apple-chat-plus-btn"
            title="Options"
          >
            <Plus size={16} />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about subscriptions, billing, quotations..."
            className="apple-chat-text-box"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="apple-chat-submit-disc"
            aria-label="Send message"
          >
            <ArrowUp size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
