import { prisma } from "../db.js";
import { AIContext } from "../types/ai.types.js";

export class ProjectContext {
  static async getProjectDetails(context: AIContext, projectId: string) {
    // 1. Fetch raw data
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
    return prisma.project.findUnique({
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
  }
}
