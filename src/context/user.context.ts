import { prisma } from "../db.js";
import { UnauthorizedError, McpError, McpErrorCode } from "../errors/mcp.errors.js";

const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);

export class UserContext {
  /**
   * Fetch a real user from the database.
   * This replaces hardcoded role/identity simulations.
   */
  static async getUserById(userId: string) {
    if (!isValidObjectId(userId)) {
      throw new McpError(McpErrorCode.INVALID_PARAMS, `Invalid User ID format: ${userId}`);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      }
    });

    if (!user) {
      throw new UnauthorizedError(`User with ID ${userId} not found or inactive.`);
    }

    return user;
  }

  static async validateUserStatus(userId: string) {
    const user = await this.getUserById(userId);
    if (!user.status) {
      throw new UnauthorizedError("User account is disabled.");
    }
    return user;
  }
}
