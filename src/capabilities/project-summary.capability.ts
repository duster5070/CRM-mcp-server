import { ProjectContext, PermissionsContext } from "../context/index.js";
import { ProjectSummary, AIContext } from "../types/ai.types.js";
import { AIPermissionsPolicy } from "../policies/ai-permissions.policy.js";
import { ProjectSummaryPrompt } from "../prompts/templates/project-summary.prompt.js";
import { UnauthorizedError } from "../errors/mcp.errors.js";

export class ProjectSummaryCapability {
  static async summarize(context: AIContext, projectId: string): Promise<ProjectSummary | string | null> {
    // 1. Get Membership & Flags (Senior Dev Way)
    const auth = await PermissionsContext.getProjectMembership(context.userId, projectId);
    
    // 2. Policy Enforcement
    if (!AIPermissionsPolicy.canReadProject(context, auth)) {
      throw new UnauthorizedError("You do not have permission to view this project summary.");
    }

    const data = await ProjectContext.getProjectSummaryData(projectId);
    if (!data) return null;

    const tasks = data.modules.flatMap(m => m.tasks);
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t: any) => t.status === 'COMPLETED').length;
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // financial calculations
    const totalPaid = data.payments.reduce((sum: number, p: any) => sum + p.amount, 0);
    const totalInvoiced = data.invoices.reduce((sum: number, i: any) => sum + i.amount, 0);
    const outstanding = Math.max(0, totalInvoiced - totalPaid);
    const budgetUsed = data.budget && data.budget > 0 ? (totalPaid / data.budget) * 100 : 0;
    
    let statusString = "ON_TRACK";
    if (data.endDate && new Date(data.endDate) < new Date() && progress < 100) {
      statusString = "DELAYED";
    }

    const summaryText = ProjectSummaryPrompt.format(data, progress, totalPaid, budgetUsed, outstanding, statusString);

    return {
      projectId,
      summary: summaryText,
      status: statusString,
      completionPercentage: Math.round(progress)
    };
  }
}
