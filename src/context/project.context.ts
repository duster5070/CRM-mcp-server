import { prisma } from "../db.js";
import { AIContext } from "../types/ai.types.js";
import { McpError, McpErrorCode } from "../errors/mcp.errors.js";

const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);

export class ProjectContext {
  static async getProjectDetails(context: AIContext, projectId: string) {
    // 1. Fetch raw data
    if (!isValidObjectId(projectId)) {
      throw new McpError(McpErrorCode.INVALID_PARAMS, `Invalid Project ID format: ${projectId}`);
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        modules: {
          include: {
            tasks: true,
          }
        },
        members: true,
        user: true, // Owner
      },
    });

    if (!project) return null;

    // 2. Here we could filter based on permissions if needed, 
    // although Policy layer usually handles the "can I even ask?" check.
    
    return project;
  }

  static async getProjectSummaryData(projectId: string) {
    if (!isValidObjectId(projectId)) {
       throw new McpError(McpErrorCode.INVALID_PARAMS, `Invalid Project ID format: ${projectId}`);
    }

    try {
      return await prisma.project.findUnique({
        where: { id: projectId },
      select: {
        name: true,
        description: true,
        status: true,
        budget: true,
        startDate: true,
        endDate: true,
        freeDomain: true,
        customDomain: true,
        userId: true, // Project Owner ID
        modules: {
          select: {
            name: true,
            tasks: {
              select: {
                status: true,
                title: true,
              }
            }
          }
        },
        payments: {
          select: {
            amount: true,
            date: true
          }
        },
        members: {
          select: {
            id: true, // For policy checking
            name: true,
            role: true
          }
        },
        invoices: {
          select: {
            amount: true,
            status: true,
            duedate: true
          }
        },
        comments: {
          take: 3,
          orderBy: {
            createdAt: 'desc'
          },
          select: {
            content: true,
            userName: true,
            createdAt: true
          }
        }
      }
      });
    } catch (error) {
       console.error("Prisma Fetch Error:", error);
       throw new McpError(McpErrorCode.INTERNAL_ERROR, "Failed to retrieve project data from database.");
    }
  }
}
