import { prisma } from "../db.js";
import { UnauthorizedError, McpError, McpErrorCode } from "../errors/mcp.errors.js";

const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);

export class PermissionsContext {
  /**
   * Verifies if a user is a member of a project.
   */
  static async getProjectMembership(userId: string, projectId: string) {
    if (!isValidObjectId(userId) || !isValidObjectId(projectId)) {
      throw new McpError(McpErrorCode.INVALID_PARAMS, "Invalid ID format. Must be a 24-character hex string.");
    }

    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new UnauthorizedError("User not found.");

      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          OR: [
            { userId: userId }, // Owner (USER Role)
            { clientId: userId }, // Client (CLIENT Role)
            { members: { some: { email: { equals: user.email } } } } // Contributor (MEMBER Role)
          ]
        },
        include: {
          members: true
        }
      });

      if (!project) {
        throw new UnauthorizedError("You do not have permission to access this project.");
      }

      return {
        project,
        isOwner: project.userId === userId,
        isClient: project.clientId === userId,
        isMember: project.members.some(m => m.email === user.email)
      };
    } catch (error) {
       // If Prisma throws due to invalid ID format, catch it gracefully
       if (error instanceof Error && error.message.includes("Inconsistent column data")) {
         throw new McpError(McpErrorCode.INVALID_PARAMS, "Invalid Project ID format. Must be a 24-character hex string.");
       }
       throw error;
    }
  }

  /**
   * Simplified RBAC check for AI operations
   */
  static async canPerformAiAction(userId: string, action: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    // In a real system, we might have an 'AiPermissions' table.
    // For now, we use roles.
    const allowedRoles = ['ADMIN', 'MEMBER'];
    if (!user || !allowedRoles.includes(user.role)) {
      throw new UnauthorizedError(`Role ${user?.role} is not authorized for action: ${action}`);
    }
    
    return true;
  }
}
