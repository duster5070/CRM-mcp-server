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

  /**
   * Create a new project
   */
  static async createProject(userId: string, data: {
    name: string;
    description?: string;
    clientId: string;
    budget?: number;
    startDate?: Date;
    endDate?: Date;
  }) {
    if (!isValidObjectId(userId) || !isValidObjectId(data.clientId)) {
      throw new McpError(McpErrorCode.INVALID_PARAMS, "Invalid User ID or Client ID format.");
    }

    try {
      // Generate a slug from the project name
      const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();

      const project = await prisma.project.create({
        data: {
          name: data.name,
          slug,
          description: data.description,
          clientId: data.clientId,
          userId,
          budget: data.budget || 0,
          startDate: data.startDate || new Date(),
          endDate: data.endDate,
          status: 'ONGOING',
        },
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
          createdAt: true,
        },
      });

      return project;
    } catch (error) {
      console.error("Prisma Create Error:", error);
      throw new McpError(McpErrorCode.INTERNAL_ERROR, "Failed to create project.");
    }
  }

  /**
   * Delete a project (with ownership verification)
   */
  static async deleteProject(userId: string, projectId: string) {
    if (!isValidObjectId(userId) || !isValidObjectId(projectId)) {
      throw new McpError(McpErrorCode.INVALID_PARAMS, "Invalid User ID or Project ID format.");
    }

    try {
      // First verify ownership
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { userId: true },
      });

      if (!project) {
        throw new McpError(McpErrorCode.NOT_FOUND, "Project not found.");
      }

      if (project.userId !== userId) {
        throw new McpError(McpErrorCode.FORBIDDEN, "You do not have permission to delete this project.");
      }

      // Delete the project (cascade will handle related records)
      await prisma.project.delete({
        where: { id: projectId },
      });

      return { success: true, projectId };
    } catch (error: any) {
      if (error instanceof McpError) throw error;
      console.error("Prisma Delete Error:", error);
      throw new McpError(McpErrorCode.INTERNAL_ERROR, "Failed to delete project.");
    }
  }

  /**
   * Update task status
   */
  static async updateTaskStatus(userId: string, taskId: string, status: 'TODO' | 'INPROGRESS' | 'COMPLETED') {
    if (!isValidObjectId(userId) || !isValidObjectId(taskId)) {
      throw new McpError(McpErrorCode.INVALID_PARAMS, "Invalid User ID or Task ID format.");
    }

    try {
      // Verify the user has access to this task through project ownership or membership
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
          module: {
            include: {
              project: {
                select: {
                  userId: true,
                  members: {
                    select: { id: true },
                  },
                },
              },
            },
          },
        },
      });

      if (!task) {
        throw new McpError(McpErrorCode.NOT_FOUND, "Task not found.");
      }

      const isOwner = task.module.project.userId === userId;
      const isMember = task.module.project.members.some(m => m.id === userId);

      if (!isOwner && !isMember) {
        throw new McpError(McpErrorCode.FORBIDDEN, "You do not have permission to update this task.");
      }

      // Update the task status
      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: { status },
        select: {
          id: true,
          title: true,
          status: true,
          updatedAt: true,
        },
      });

      return updatedTask;
    } catch (error: any) {
      if (error instanceof McpError) throw error;
      console.error("Prisma Update Error:", error);
      throw new McpError(McpErrorCode.INTERNAL_ERROR, "Failed to update task status.");
    }
  }
}
