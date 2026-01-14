import { ProjectContext } from "../context/project.context.js";
import { RiskReport, AIContext } from "../types/ai.types.js";
import { AIPermissionsPolicy } from "../policies/ai-permissions.policy.js";

export class RiskAnalysisCapability {
  static async analyze(context: AIContext, projectId: string): Promise<RiskReport | string | null> {
    const data = await ProjectContext.getProjectSummaryData(projectId);
    if (!data) return null;

    // Check Permissions
    const memberIds = data.members.map((m: any) => m.id);
    const hasAccess = AIPermissionsPolicy.canReadProject(context, memberIds, data.userId);

    if (!hasAccess) {
      return "ACCESS_DENIED: You do not have permission to view this risk report.";
    }

    // 1. Task Progress Metrics
    const tasks = data.modules.flatMap(m => m.tasks);
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t: any) => t.status === 'COMPLETED').length;
    const taskVelocity = totalTasks > 0 ? completedTasks / totalTasks : 0;

    // 2. Timeline Metrics
    const now = new Date();
    const start = new Date(data.startDate);
    const end = data.endDate ? new Date(data.endDate) : null;
    
    let timeVelocity = 0;
    if (end && end > start) {
      const totalDuration = end.getTime() - start.getTime();
      const elapsed = now.getTime() - start.getTime();
      timeVelocity = Math.min(1, Math.max(0, elapsed / totalDuration));
    }

    // 3. Financial Metrics
    const totalPaid = data.payments.reduce((sum: number, p: any) => sum + p.amount, 0);
    const totalInvoiced = data.invoices.reduce((sum: number, i: any) => sum + i.amount, 0);
    const outstanding = Math.max(0, totalInvoiced - totalPaid);
    const budgetUsed = data.budget && data.budget > 0 ? (totalPaid / data.budget) : 0;

    // 4. Probability Calculation (Senior Grade Logic)
    // Risk increases if timeline is further ahead than tasks (Velocity Gap)
    // Risk increases if budget is high/over but tasks are low
    const velocityGap = Math.max(0, timeVelocity - taskVelocity);
    let probability = 0.1 + (velocityGap * 0.7); // Base 10% + up to 70% gap risk
    
    if (end && now > end && taskVelocity < 1) probability = 1.0; // Overdue is 100% risk

    // 5. Recommendations
    const recommendations: string[] = [];
    if (velocityGap > 0.3) {
      recommendations.push("The project timeline is progressing faster than task completion. Consider adding resources.");
    }
    if (outstanding > (data.budget || 0) * 0.3) {
      recommendations.push("High outstanding balance detected. Follow up on unpaid invoices to maintain cash flow.");
    }
    if (totalTasks === 0) {
      recommendations.push("No tasks defined for this project. Defined modules but no actionable tasks.");
    }
    if (completedTasks === 0 && timeVelocity > 0.2) {
      recommendations.push("Stagnation Alert: 20% of timeline elapsed with 0 tasks completed.");
    }

    return {
      projectId,
      delayProbability: Math.min(1, probability),
      budgetHealth: budgetUsed > 1.1 ? 'OVER_BUDGET' : (budgetUsed > 0.9 ? 'UNDER_BUDGET' : 'HEALTHY'),
      recommendations: recommendations.length > 0 ? recommendations : ["Project is performing within expected parameters."]
    };
  }
}
