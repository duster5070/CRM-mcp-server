import { AnalyticsContext } from "../context/index.js";
import { AIContext } from "../types/ai.types.js";

export class AnalyticsCapability {
  /**
   * Get comprehensive dashboard overview
   */
  static async getDashboardOverview(context: AIContext) {
    const overview = await AnalyticsContext.getDashboardOverview(context);

    // Format the response for AI consumption
    const summary = `
Dashboard Overview for User ${context.userId}:

Projects:
- Total: ${overview.projects.total}
- Ongoing: ${overview.projects.ongoing}
- Completed: ${overview.projects.completed}

Tasks:
- Total: ${overview.tasks.total}
- Completed: ${overview.tasks.completed} (${overview.tasks.completionRate.toFixed(1)}%)
- In Progress: ${overview.tasks.inProgress}
- To Do: ${overview.tasks.todo}

Financials:
- Total Budget: $${overview.financials.totalBudget.toLocaleString()}
- Total Invoiced: $${overview.financials.totalInvoiced.toLocaleString()}
- Total Paid: $${overview.financials.totalPaid.toLocaleString()}
- Outstanding: $${overview.financials.outstanding.toLocaleString()}
- Collection Rate: ${overview.financials.collectionRate.toFixed(1)}%

Recent Projects:
${overview.recentProjects.map(p => `- ${p.name} (${p.status})`).join('\n')}
    `.trim();

    return {
      summary,
      data: overview,
    };
  }

  /**
   * Get project statistics for a time period
   */
  static async getProjectStatsByPeriod(context: AIContext, startDate: Date, endDate: Date) {
    const stats = await AnalyticsContext.getProjectStatsByPeriod(context.userId, startDate, endDate);

    return {
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      stats,
    };
  }
}
