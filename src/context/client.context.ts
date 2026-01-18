import { prisma } from "../db.js";
import { McpError, McpErrorCode } from "../errors/mcp.errors.js";

const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);

export class ClientContext {
  /**
   * Get all clients for a specific user (where the user is the project owner)
   */
  static async getUserClients(userId: string) {
    if (!isValidObjectId(userId)) {
      throw new McpError(McpErrorCode.INVALID_PARAMS, `Invalid User ID format: ${userId}`);
    }

    try {
      // Get all unique client IDs from projects owned by this user
      const projects = await prisma.project.findMany({
        where: { userId },
        select: {
          clientId: true,
        },
        distinct: ['clientId'],
      });

      const clientIds = projects.map(p => p.clientId);

      if (clientIds.length === 0) {
        return [];
      }

      // Fetch client details (clients are Users with role CLIENT)
      const clients = await prisma.user.findMany({
        where: {
          id: { in: clientIds },
          role: 'CLIENT',
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          companyName: true,
          status: true,
        },
      });

      return clients;
    } catch (error) {
      console.error("Prisma Fetch Error in getUserClients:", error);
      throw new McpError(McpErrorCode.INTERNAL_ERROR, "Failed to retrieve clients from database.");
    }
  }

  /**
   * Get recent clients (last 5) based on project creation date
   */
  static async getRecentUserClients(userId: string, limit: number = 5) {
    if (!isValidObjectId(userId)) {
      throw new McpError(McpErrorCode.INVALID_PARAMS, `Invalid User ID format: ${userId}`);
    }

    try {
      const recentProjects = await prisma.project.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          clientId: true,
        },
        distinct: ['clientId'],
      });

      const clientIds = recentProjects.map(p => p.clientId);

      if (clientIds.length === 0) {
        return [];
      }

      const clients = await prisma.user.findMany({
        where: {
          id: { in: clientIds },
          role: 'CLIENT',
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          companyName: true,
          status: true,
        },
      });

      return clients;
    } catch (error) {
      console.error("Prisma Fetch Error in getRecentUserClients:", error);
      throw new McpError(McpErrorCode.INTERNAL_ERROR, "Failed to retrieve recent clients from database.");
    }
  }

  /**
   * Get client project history
   */
  static async getClientProjectHistory(userId: string, clientId: string) {
    if (!isValidObjectId(userId) || !isValidObjectId(clientId)) {
      throw new McpError(McpErrorCode.INVALID_PARAMS, "Invalid User ID or Client ID format.");
    }

    try {
      const projects = await prisma.project.findMany({
        where: {
          userId,
          clientId,
        },
        select: {
          id: true,
          name: true,
          status: true,
          budget: true,
          startDate: true,
          endDate: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return projects;
    } catch (error) {
      console.error("Prisma Fetch Error in getClientProjectHistory:", error);
      throw new McpError(McpErrorCode.INTERNAL_ERROR, "Failed to retrieve client project history.");
    }
  }
}
