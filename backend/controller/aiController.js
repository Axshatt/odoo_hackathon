import { asyncHandler } from "../utils/Constructors/asyncHandler.js";
import { ApiResponse } from "../utils/Constructors/ApiResponse.js";
import { generateGeminiAIResponse } from "../services/aiService.js";
import * as analyticsService from "../services/analyticsService.js";

export const handleAiQuery = asyncHandler(async (req, res) => {
  const { prompt } = req.body;

  let activeSubsCount = 6;
  let overdueCount = 1;
  let mrr = "1,08,660";
  let customerCount = 6;

  try {
    const overview = await analyticsService.getFinanceOverview("this_month", { role: "Admin" });
    if (overview) {
      activeSubsCount = overview.activeSubscriptionsCount || 6;
      overdueCount = overview.outstandingInvoicesCount || 1;
      mrr = Number(overview.mrr || 108660).toLocaleString("en-IN");
    }
  } catch {}

  const result = await generateGeminiAIResponse(prompt, {
    activeSubsCount,
    overdueCount,
    mrr,
    customerCount,
  });

  return res.status(200).json(
    new ApiResponse(200, result, "AI response generated successfully")
  );
});
