import { ProjectContext, PermissionsContext } from "../context/index.js";
import { AIContext } from "../types/ai.types.js";
import { AIPermissionsPolicy } from "../policies/ai-permissions.policy.js";
import { UnauthorizedError, McpError, McpErrorCode } from "../errors/mcp.errors.js";

export class ProjectManagerCapability {
  /**
   * Create a new project
   */
  static async createProject(context: AIContext, data: {
    name: string;
    description?: string;
    clientId: string;
    budget?: number;
    startDate?: Date;
    endDate?: Date;
  }) {
    // Verify user has permission to create projects (typically ADMIN or USER role)
    if (!AIPermissionsPolicy.canCreateProject(context)) {
      throw new UnauthorizedError("Only ADMIN or USER roles can create projects.");
    }

    // Validate required fields
    if (!data.name || data.name.trim().length === 0) {
      throw new McpError(McpErrorCode.INVALID_PARAMS, "Project name is required.");
    }

    if (!data.clientId) {
      throw new McpError(McpErrorCode.INVALID_PARAMS, "Client ID is required.");
    }

    const project = await ProjectContext.createProject(context.userId, data);

    return {
      success: true,
      project,
      message: `Project "${project.name}" created successfully.`,
    };
  }

  /**
   * Delete a project
   */
  static async deleteProject(context: AIContext, projectId: string) {
    // Get project membership to verify ownership
    const auth = await PermissionsContext.getProjectMembership(context.userId, projectId);

    // Only the owner can delete a project
    if (!AIPermissionsPolicy.canDeleteProject(context, auth)) {
      throw new UnauthorizedError("Only the project owner can delete a project.");
    }

    const result = await ProjectContext.deleteProject(context.userId, projectId);

    return {
      success: result.success,
      message: `Project deleted successfully.`,
    };
  }

  /**
   * Update task status
   */
  static async updateTaskStatus(context: AIContext, taskId: string, status: 'TODO' | 'INPROGRESS' | 'COMPLETED') {
    // The ProjectContext.updateTaskStatus already handles permission verification
    const updatedTask = await ProjectContext.updateTaskStatus(context.userId, taskId, status);

    return {
      success: true,
      task: updatedTask,
      message: `Task "${updatedTask.title}" status updated to ${status}.`,
    };
  }
}
