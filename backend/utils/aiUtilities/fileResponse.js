export const formatFileResponse = (fileName, fileUrl, mimeType, size = 0, extractedData = null) => {
  return {
    type: "file",
    fileName,
    fileUrl,
    mimeType,
    size,
    extractedData,
    processedAt: new Date().toISOString(),
  };
};

export const parseInvoiceCsvRow = (rowString = "") => {
  const parts = rowString.split(",").map((p) => p.trim());
  return {
    invoiceNumber: parts[0] || "",
    customer: parts[1] || "",
    amount: parseFloat(parts[2]) || 0,
    status: parts[3] || "Draft",
  };
};

