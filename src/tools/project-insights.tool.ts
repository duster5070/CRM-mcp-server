import { z } from "zod";
import { ProjectSummaryCapability } from "../capabilities/project-summary.capability.js";
import { RiskAnalysisCapability } from "../capabilities/risk-analysis.capability.js";
import { AIContext } from "../types/ai.types.js";

export const getProjectSummaryTool = {
  name: "get_project_summary",
  description: "Get a high-level summary of a project including progress and status.",
  inputSchema: z.object({
    projectId: z.string().describe("The ID of the project to summarize"),
  }),
  handler: async (context: AIContext, { projectId }: { projectId: string }) => {
    return await ProjectSummaryCapability.summarize(context, projectId);
  },
};

export const getProjectRiskTool = {
  name: "get_project_risk",
  description: "Analyze delay risks and budget health for a project.",
  inputSchema: z.object({
    projectId: z.string().describe("The ID of the project to analyze"),
  }),
  handler: async (context: AIContext, { projectId }: { projectId: string }) => {
    return await RiskAnalysisCapability.analyze(context, projectId);
  },
};
