export const formatTextResponse = (prompt, result, metadata = {}) => {
  return {
    type: "text",
    prompt,
    result,
    metadata: {
      generatedAt: new Date().toISOString(),
      ...metadata,
    },
  };
};

export const summarizeBillingSummary = (subscriptions = [], invoices = []) => {
  const activeCount = subscriptions.filter((s) => s.status === "Active").length;
  const unpaidCount = invoices.filter((i) => i.status === "Confirmed").length;
  return `Account has ${activeCount} active subscriptions and ${unpaidCount} pending invoices awaiting payment.`;
};

