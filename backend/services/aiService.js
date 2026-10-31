import { ENV } from "../config/env.js";

export const generateGeminiAIResponse = async (prompt, systemContext = {}) => {
  const apiKey = ENV.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      text: "Gemini API key is not configured.",
      suggestedAction: null,
    };
  }

  const promptText = `Task: You are Brightloop Intelligence, an AI copilot for Brightloop Software's Subscription Management System.
Context:
- Active Subscriptions: ${systemContext.activeSubsCount ?? 6}
- Overdue Invoices: ${systemContext.overdueCount ?? 1}
- Monthly Recurring Revenue (MRR): ₹${systemContext.mrr ?? "1,08,660"}
- Total Customers: ${systemContext.customerCount ?? 6}

Question: ${prompt}

Instruction: Reply ONLY with the final response text in 2-3 clean, polite sentences. Do NOT output internal thoughts, personas, drafts, or reasoning.`;

  const payload = {
    contents: [
      {
        parts: [
          {
            text: promptText,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 250,
    },
  };

  const models = [
    "gemini-2.5-flash",
    "gemma-4-26b-a4b-it",
    "gemma-4-31b-it",
  ];

  let rawText = "";

  for (const model of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        if (candidateText && !candidateText.includes("*   Draft")) {
          rawText = candidateText;
          break;
        } else if (candidateText) {
          const lines = candidateText.split("\n").filter((l) => l.trim() && !l.includes("Draft") && !l.includes("Persona:") && !l.includes("Tone:"));
          const lastLine = lines[lines.length - 1]?.replace(/^[#*"-]+/, "").replace(/["*]+$/, "").trim();
          if (lastLine) {
            rawText = lastLine;
            break;
          }
        }
      }
    } catch {}
  }

  let action = null;
  const lower = prompt.toLowerCase();
  if (lower.includes("bill") || lower.includes("batch") || lower.includes("due invoice")) {
    action = "batch_billing";
  } else if (lower.includes("settle") || lower.includes("pay") || lower.includes("overdue")) {
    action = "quick_pay";
  } else if (lower.includes("quote") || lower.includes("offer") || lower.includes("new sub")) {
    action = "new_quote";
  } else if (lower.includes("discount") || lower.includes("seat")) {
    action = "apply_discount";
  } else if (lower.includes("mrr") || lower.includes("overview") || lower.includes("report") || lower.includes("analytics")) {
    action = "analytics";
  }

  if (!rawText) {
    if (action === "batch_billing") {
      rawText = `I can execute an automated billing run across all ${systemContext.activeSubsCount ?? 6} active subscriptions with automatic 18% GST calculation and zero double-billing risk.`;
    } else if (action === "quick_pay") {
      rawText = `There are currently ${systemContext.overdueCount ?? 1} overdue invoices. One-click instant UPI settlement is ready to advance the billing cycle.`;
    } else if (action === "new_quote") {
      rawText = `Quotation templates are configured. You can draft custom offers with pre-approved products, seat quantities, and validity terms.`;
    } else if (action === "apply_discount") {
      rawText = `Admin volume discount rules can apply 10% or custom seat reductions directly to active subscription renewal lines.`;
    } else if (action === "analytics") {
      rawText = `Current Monthly Recurring Revenue is ₹${systemContext.mrr ?? "1,08,660"} with ${systemContext.activeSubsCount ?? 6} active accounts and ${systemContext.overdueCount ?? 1} pending settlement.`;
    } else {
      rawText = `Brightloop Intelligence is active. Managing ${systemContext.activeSubsCount ?? 6} subscriptions and ₹${systemContext.mrr ?? "1,08,660"} in recurring cash flow. How can I assist with billing or quotations?`;
    }
  }

  return {
    text: rawText.trim(),
    suggestedAction: action,
  };
};
