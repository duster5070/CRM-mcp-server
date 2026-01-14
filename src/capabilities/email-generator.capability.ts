import { ProjectContext } from "../context/project.context.js";
import { EmailGenerationInput, Generatedemail, AIContext } from "../types/ai.types.js";
import { AIPermissionsPolicy } from "../policies/ai-permissions.policy.js";

export class EmailGeneratorCapability {
  static async generate(context: AIContext, input: EmailGenerationInput): Promise<Generatedemail | string> {
    let projectData = null;
    let progress = 0;

    if (input.projectId) {
      projectData = await ProjectContext.getProjectSummaryData(input.projectId);
      if (projectData) {
        // Check Permissions
        const memberIds = projectData.members.map((m: any) => m.id);
        const hasAccess = AIPermissionsPolicy.canReadProject(context, memberIds, projectData.userId);

        if (!hasAccess) {
          return "ACCESS_DENIED: You do not have permission to generate emails for this project.";
        }

        const tasks = projectData.modules.flatMap(m => m.tasks);
        const total = tasks.length;
        const completed = tasks.filter((t: any) => t.status === 'COMPLETED').length;
        progress = total > 0 ? Math.round((completed / total) * 100) : 0;
      }
    }

    const isFormal = input.tone === 'FORMAL';
    const salutation = isFormal ? `Dear Mr./Ms. ${input.recipientName},` : `Hi ${input.recipientName}!`;
    const closing = isFormal ? "Sincerely,\nThe CRM Project Team" : "Best regards,\nThe Team";

    const contentMap = {
      'REMINDER': isFormal 
        ? `I am writing to provide a formal update regarding the progress of "${projectData?.name || 'our current project'}". We have reached ${progress}% completion and are proceeding in accordance with the established schedule.` 
        : `Just a quick note to let you know that ${projectData?.name || 'the project'} is moving along great! We're already ${progress}% done.`,
      
      'UPDATE': isFormal
        ? `Please find enclosed the latest status report for your review. We are currently focusing on the next set of deliverables with high efficiency.`
        : `Hey! Things are looking awesome. We've made some solid progress this week and wanted to keep you in the loop on how everything is shaping up.`,
      
      'PAYMENT_REQUEST': isFormal
        ? `We have issued a new invoice for services rendered on "${projectData?.name || 'the project'}". Your prompt attention to this matter would be greatly appreciated to ensure continued momentum.`
        : `We just sent over a new invoice for the latest work on ${projectData?.name || 'the project'}. Let us know if you have any questions—otherwise, we're ready to dive into the next phase!`
    };

    const subjectPrefix = isFormal ? "[Update] " : "✨ ";
    const projectName = projectData?.name || "Project Progress";

    return {
      subject: `${subjectPrefix}${projectName} - ${input.emailType.replace('_', ' ')}`,
      body: `${salutation}\n\n${contentMap[input.emailType]}\n\n${closing}`
    };
  }
}
