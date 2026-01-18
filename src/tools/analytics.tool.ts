import { z } from "zod";
import { AnalyticsCapability } from "../capabilities/analytics.capability.js";
import { AIContext } from "../types/ai.types.js";

export const getDashboardOverviewTool = {
  name: "get_dashboard_overview",
  description: "Get a comprehensive overview of all projects, tasks, and financials for the user.",
  inputSchema: z.object({}),
  handler: async (context: AIContext) => {
    return await AnalyticsCapability.getDashboardOverview(context);
  },
};

export const getProjectStatsByPeriodTool = {
  name: "get_project_stats_by_period",
  description: "Get project statistics for a specific time period.",
  inputSchema: z.object({
    startDate: z.string().describe("Start date in ISO format"),
    endDate: z.string().describe("End date in ISO format"),
  }),
  handler: async (context: AIContext, { startDate, endDate }: { startDate: string; endDate: string }) => {
    return await AnalyticsCapability.getProjectStatsByPeriod(
      context,
      new Date(startDate),
      new Date(endDate)
    );
  },
};
