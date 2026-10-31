"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Zap,
  CreditCard,
  FileText,
  BarChart3,
  X,
  Send,
  ArrowUp,
  Check,
  ChevronDown,
  RotateCcw,
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

interface AiAssistantProps {
  data: Store;
  setData: React.Dispatch<React.SetStateAction<Store>>;
  role: string;
  navigate: (page: any) => void;
  notify: (msg: string) => void;
  setSelected: (sub: Subscription | null) => void;
  setInvoice: (inv: Invoice | null) => void;
  setModal: (modal: any) => void;
}

interface Message {
  id: string;
  sender: "ai" | "user";
  text: string;
  timestamp: string;
  actionCard?: {
    type: "batch_billing" | "quick_pay" | "new_quote" | "apply_discount" | "analytics";
    title: string;
    description: string;
    buttonLabel: string;
    executed?: boolean;
    data?: any;
  };
}

export function AiAssistant({
  data,
  setData,
  role,
  navigate,
  notify,
  setSelected,
  setInvoice,
  setModal,
}: AiAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      id: "initial-1",
      sender: "ai",
      text: "Hello, I am Brightloop Intelligence. I am tracking your subscriptions, recurring billing cycles, and outstanding cash flow. How can I assist you right now?",
      timestamp: "Just now",
      actionCard: overdueInvoices.length > 0 ? {
        type: "quick_pay",
        title: `${overdueInvoices.length} Overdue Invoices Need Attention`,
        description: `Total ₹${overdueInvoices.reduce((a, b) => a + b.total, 0).toLocaleString("en-IN")} pending. First overdue is ${overdueInvoices[0]?.customer} (${overdueInvoices[0]?.id}).`,
        buttonLabel: `Settle ${overdueInvoices[0]?.customer} Invoice`,
        data: overdueInvoices[0],
      } : undefined,
    },
  ]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

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
        notify(`Batch billing completed. ${createdCount} invoices drafted.`);
        appendAiResponse(
          `Success: Generated ${createdCount} new invoices for current billing period. All customer lines and tax rates were calculated automatically.`
        );
      } else {
        notify("All active subscriptions are already up-to-date.");
        appendAiResponse(
          "All active subscriptions already have active invoices for their upcoming cycle. No duplicate billing generated."
        );
      }
    } else if (actionType === "quick_pay") {
      const targetInvoice =
        actionData || overdueInvoices[0] || confirmedInvoices[0];
      if (!targetInvoice) {
        notify("No unpaid invoice found.");
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

      notify(`Payment of ${money(targetInvoice.total)} recorded for ${targetInvoice.customer}.`);
      appendAiResponse(
        `Recorded full payment of ${money(targetInvoice.total)} for ${targetInvoice.customer}. Invoice status marked as Paid and next billing cycle advanced.`
      );
    } else if (actionType === "new_quote") {
      setModal("new");
      notify("Opened subscription draft studio.");
      appendAiResponse(
        "Opened the subscription quotation studio. You can configure plans, seats, and custom approved discounts."
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
      notify("Applied 10% volume discount across subscriptions.");
      appendAiResponse(
        "Applied standard 10% volume discount across customer accounts. Future recurring invoices will reflect discounted subtotals."
      );
    } else if (actionType === "analytics") {
      navigate("Overview");
      appendAiResponse(
        `Workspace Analytics Summary:\n• Monthly Recurring Revenue: ${money(mrr)}\n• Active Subscriptions: ${activeSubs.length}\n• Outstanding Invoices: ${confirmedInvoices.length} (${money(confirmedInvoices.reduce((a, b) => a + b.total, 0))})\n• Overdue Accounts: ${overdueInvoices.length}`
      );
    }
  };

  const appendAiResponse = (text: string, card?: Message["actionCard"]) => {
    setIsTyping(true);
    setTimeout(() => {
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
      setIsTyping(false);
    }, 400);
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

    const lower = query.toLowerCase();

    if (lower.includes("bill") || lower.includes("invoice") || lower.includes("batch")) {
      appendAiResponse(
        "I can run an idempotent billing batch across all active accounts without duplicates.",
        {
          type: "batch_billing",
          title: "Run Recurring Billing Batch",
          description: `Will evaluate ${activeSubs.length} active subscriptions and draft invoices for due dates.`,
          buttonLabel: "Generate Due Invoices",
        }
      );
    } else if (lower.includes("pay") || lower.includes("overdue") || lower.includes("settle")) {
      if (overdueInvoices.length > 0) {
        appendAiResponse(
          `Found ${overdueInvoices.length} overdue invoices totaling ₹${overdueInvoices.reduce((a, b) => a + b.total, 0).toLocaleString("en-IN")}.`,
          {
            type: "quick_pay",
            title: `Settle ${overdueInvoices[0].customer}`,
            description: `Invoice ${overdueInvoices[0].id} is past due date (${overdueInvoices[0].due}). Amount: ${money(overdueInvoices[0].total)}.`,
            buttonLabel: `Record UPI Payment for ${overdueInvoices[0].customer}`,
            data: overdueInvoices[0],
          }
        );
      } else {
        appendAiResponse(
          "All invoices are currently up to date. No accounts are marked overdue right now."
        );
      }
    } else if (lower.includes("quote") || lower.includes("offer") || lower.includes("new sub")) {
      appendAiResponse(
        "Sales reps can prepare proposals using standard templates with set validity and pre-configured lines.",
        {
          type: "new_quote",
          title: "Prepare Subscription Quotation",
          description: "Choose plan, seat quantity, and discount parameters.",
          buttonLabel: "Create Quotation Draft",
        }
      );
    } else if (lower.includes("discount") || lower.includes("price") || lower.includes("rate")) {
      appendAiResponse(
        "Admin discount rules allow percentage or fixed reductions based on minimum seats or volume.",
        {
          type: "apply_discount",
          title: "Apply 10% Seat Volume Discount",
          description: "Apply pre-approved 10% discount rule to eligible active accounts.",
          buttonLabel: "Apply 10% Discount Rule",
        }
      );
    } else if (lower.includes("mrr") || lower.includes("revenue") || lower.includes("report")) {
      appendAiResponse(
        `Current MRR stands at ${money(mrr)}. You have ${activeSubs.length} active customer contracts and ${overdueInvoices.length} overdue invoices needing follow up.`,
        {
          type: "analytics",
          title: "Inspect Financial Health",
          description: "Open the real-time revenue and cash flow dashboard.",
          buttonLabel: "View Dashboard",
        }
      );
    } else {
      appendAiResponse(
        "I can help automate your subscription operations: run automated billing batches, settle overdue accounts, draft quotations, and apply volume discounts.",
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
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open Brightloop Intelligence"
          className="relative flex items-center gap-2.5 px-4 py-3 rounded-full shadow-lg border backdrop-blur-xl transition-all duration-300"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.92), rgba(245,247,250,0.85))",
            borderColor: "rgba(0,113,227,0.25)",
            boxShadow: "0 10px 30px -5px rgba(0,113,227,0.22), 0 0 1px 1px rgba(255,255,255,0.8) inset",
          }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white"
            style={{
              background: "linear-gradient(135deg, #0071e3 0%, #8b5cf6 50%, #ec4899 100%)",
              boxShadow: "0 2px 10px rgba(139,92,246,0.35)",
            }}
          >
            <Sparkles size={15} />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[13px] font-semibold tracking-tight text-neutral-900 dark:text-white leading-none">
              Intelligence
            </span>
            <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium leading-tight mt-0.5">
              {overdueInvoices.length > 0
                ? `${overdueInvoices.length} action needed`
                : "Ready to assist"}
            </span>
          </div>

          {overdueInvoices.length > 0 && (
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse ml-1" />
          )}
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: "spring", damping: 28, stiffness: 350 }}
            className="fixed bottom-22 right-6 z-50 w-[410px] max-w-[calc(100vw-32px)] h-[570px] max-h-[calc(100vh-110px)] rounded-[26px] overflow-hidden flex flex-col border shadow-2xl backdrop-blur-2xl"
            style={{
              background: "var(--glass)",
              borderColor: "var(--line)",
              boxShadow:
                "0 24px 60px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.15) inset",
            }}
          >
            <div
              className="p-4 pb-3 flex items-center justify-between border-b backdrop-blur-md"
              style={{ borderColor: "var(--line)" }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                  style={{
                    background:
                      "linear-gradient(135deg, #0071e3 0%, #8b5cf6 50%, #ec4899 100%)",
                  }}
                >
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="text-[14px] font-semibold text-neutral-900 dark:text-white leading-tight">
                    Brightloop Intelligence
                  </h3>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    Apple-grade Autonomous Billing Assistant
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-neutral-200/60 dark:hover:bg-neutral-700/60 transition-colors text-neutral-500"
              >
                <X size={16} />
              </button>
            </div>

            <div
              className="px-4 py-2 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border-b flex items-center justify-between text-[11px]"
              style={{ borderColor: "var(--line)" }}
            >
              <span className="text-neutral-700 dark:text-neutral-300 font-medium">
                MRR: {money(mrr)} · {activeSubs.length} Active
              </span>
              {overdueInvoices.length > 0 ? (
                <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  {overdueInvoices.length} Overdue
                </span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <Check size={12} /> All Paid
                </span>
              )}
            </div>

            <div className="px-3 py-2 border-b overflow-x-auto flex gap-1.5 scrollbar-none" style={{ borderColor: "var(--line)" }}>
              <button
                onClick={() => executeAction("batch_billing")}
                className="whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1 border border-neutral-200/60 dark:border-neutral-700/60"
              >
                <Zap size={11} className="text-blue-500" /> Run Billing Batch
              </button>
              <button
                onClick={() => executeAction("quick_pay")}
                className="whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1 border border-neutral-200/60 dark:border-neutral-700/60"
              >
                <CreditCard size={11} className="text-emerald-500" /> Quick Pay Overdue
              </button>
              <button
                onClick={() => executeAction("new_quote")}
                className="whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center gap-1 border border-neutral-200/60 dark:border-neutral-700/60"
              >
                <FileText size={11} className="text-purple-500" /> New Quotation
              </button>
              <button
                onClick={() => executeAction("apply_discount")}
                className="whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1 border border-neutral-200/60 dark:border-neutral-700/60"
              >
                <SlidersHorizontal size={11} className="text-amber-500" /> Apply 10% Discount
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${
                    m.sender === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-[18px] px-3.5 py-2.5 text-[13px] leading-relaxed shadow-sm ${
                      m.sender === "user"
                        ? "bg-[#0071e3] text-white rounded-br-xs"
                        : "bg-white/90 dark:bg-neutral-800/90 text-neutral-800 dark:text-neutral-100 border border-neutral-200/70 dark:border-neutral-700/70 rounded-bl-xs"
                    }`}
                  >
                    <p className="whitespace-pre-line">{m.text}</p>

                    {m.actionCard && (
                      <div className="mt-2.5 pt-2.5 border-t border-neutral-200/60 dark:border-neutral-700/60">
                        <div className="font-semibold text-[12px] text-neutral-900 dark:text-white flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          {m.actionCard.title}
                        </div>
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                          {m.actionCard.description}
                        </p>
                        <button
                          onClick={() =>
                            executeAction(
                              m.actionCard!.type,
                              m.actionCard!.data
                            )
                          }
                          className="mt-2 w-full py-1.5 px-3 rounded-xl bg-[#0071e3] hover:bg-[#0062c4] text-white font-medium text-[12px] flex items-center justify-center gap-1.5 shadow-sm transition-all duration-200 active:scale-98"
                        >
                          <Zap size={13} />
                          {m.actionCard.buttonLabel}
                        </button>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1 px-1">
                    {m.timestamp}
                  </span>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-1.5 px-3 py-2 bg-neutral-200/50 dark:bg-neutral-800/50 rounded-full w-fit">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce [animation-delay:0.4s]" />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div
              className="p-3 border-t bg-white/40 dark:bg-neutral-900/40 backdrop-blur-md"
              style={{ borderColor: "var(--line)" }}
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="relative flex items-center"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask AI or type billing task..."
                  className="w-full pl-4 pr-11 py-2.5 rounded-full text-[13px] bg-neutral-100/80 dark:bg-neutral-800/80 border border-neutral-200/70 dark:border-neutral-700/70 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/40 transition-all"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="absolute right-1.5 w-7 h-7 rounded-full bg-[#0071e3] text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#0062c4] transition-all"
                >
                  <ArrowUp size={14} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

