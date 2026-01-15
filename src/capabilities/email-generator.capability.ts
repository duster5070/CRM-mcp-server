import { ProjectContext, PermissionsContext } from "../context/index.js";
import { EmailGenerationInput, Generatedemail, AIContext } from "../types/ai.types.js";
import { AIPermissionsPolicy } from "../policies/ai-permissions.policy.js";
import { EmailGeneratorPrompt } from "../prompts/templates/email-generator.prompt.js";
import { UnauthorizedError } from "../errors/mcp.errors.js";

export class EmailGeneratorCapability {
  static async generate(context: AIContext, input: EmailGenerationInput): Promise<Generatedemail | string> {
    let projectData = null;
    let progress = 0;

    if (input.projectId) {
      // 1. Get Membership & Flags
      const auth = await PermissionsContext.getProjectMembership(context.userId, input.projectId);
      
      // 2. Policy Enforcement (Read access needed for email context)
      if (!AIPermissionsPolicy.canReadProject(context, auth)) {
        throw new UnauthorizedError("You do not have permission to generate emails for this project.");
      }

      projectData = await ProjectContext.getProjectSummaryData(input.projectId);
      if (projectData) {
        const tasks = projectData.modules.flatMap(m => m.tasks);
        const total = tasks.length;
        const completed = tasks.filter((t: any) => t.status === 'COMPLETED').length;
        progress = total > 0 ? Math.round((completed / total) * 100) : 0;
      }
    }

    return EmailGeneratorPrompt.format(
      projectData?.name || undefined,
      progress,
      input.recipientName,
      input.emailType,
      input.tone
    );
  }
}
