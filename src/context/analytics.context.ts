import { prisma } from "../db.js";
import { AIContext } from "../types/ai.types.js";
import { McpError, McpErrorCode } from "../errors/mcp.errors.js";

const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);

export class AnalyticsContext {
  /**
   * Get comprehensive dashboard overview for a user
   */
  static async getDashboardOverview(context: AIContext) {
    if (!isValidObjectId(context.userId)) {
      throw new McpError(McpErrorCode.INVALID_PARAMS, `Invalid User ID format: ${context.userId}`);
    }

    try {
      // Get all projects for the user
      const projects = await prisma.project.findMany({
        where: { userId: context.userId },
        include: {
          modules: {
            include: {
              tasks: true,
            },
          },
          invoices: true,
          payments: true,
        },
      });

      // Calculate aggregate statistics
      const totalProjects = projects.length;
      const ongoingProjects = projects.filter(p => p.status === 'ONGOING').length;
      const completedProjects = projects.filter(p => p.status === 'COMPLETE').length;

      // Task statistics
      const allTasks = projects.flatMap(p => p.modules.flatMap(m => m.tasks));
      const totalTasks = allTasks.length;
      const completedTasks = allTasks.filter(t => t.status === 'COMPLETED').length;
      const inProgressTasks = allTasks.filter(t => t.status === 'INPROGRESS').length;
      const todoTasks = allTasks.filter(t => t.status === 'TODO').length;

      // Financial statistics
      const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
      const totalInvoiced = projects.flatMap(p => p.invoices).reduce((sum, i) => sum + i.amount, 0);
      const totalPaid = projects.flatMap(p => p.payments).reduce((sum, p) => sum + p.amount, 0);
      const outstandingAmount = totalInvoiced - totalPaid;

      // Recent activity
      const recentProjects = projects
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 5)
        .map(p => ({
          id: p.id,
          name: p.name,
          status: p.status,
          createdAt: p.createdAt,
        }));

      return {
        projects: {
          total: totalProjects,
          ongoing: ongoingProjects,
          completed: completedProjects,
        },
        tasks: {
          total: totalTasks,
          completed: completedTasks,
          inProgress: inProgressTasks,
          todo: todoTasks,
          completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
        },
        financials: {
          totalBudget,
          totalInvoiced,
          totalPaid,
          outstanding: outstandingAmount,
          collectionRate: totalInvoiced > 0 ? (totalPaid / totalInvoiced) * 100 : 0,
        },
        recentProjects,
      };
    } catch (error) {
      console.error("Prisma Fetch Error in getDashboardOverview:", error);
      throw new McpError(McpErrorCode.INTERNAL_ERROR, "Failed to retrieve dashboard overview.");
    }
  }

  /**
   * Get project statistics for a specific time period
   */
  static async getProjectStatsByPeriod(userId: string, startDate: Date, endDate: Date) {
    if (!isValidObjectId(userId)) {
      throw new McpError(McpErrorCode.INVALID_PARAMS, `Invalid User ID format: ${userId}`);
    }

    try {
      const projects = await prisma.project.findMany({
        where: {
          userId,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          id: true,
          name: true,
          status: true,
          budget: true,
          createdAt: true,
        },
      });

      return {
        count: projects.length,
        totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
        projects,
      };
    } catch (error) {
      console.error("Prisma Fetch Error in getProjectStatsByPeriod:", error);
      throw new McpError(McpErrorCode.INTERNAL_ERROR, "Failed to retrieve project statistics.");
    }
  }
}
