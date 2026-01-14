import { ProjectContext } from "../context/project.context.js";
import { ProjectSummary, AIContext } from "../types/ai.types.js";
import { AIPermissionsPolicy } from "../policies/ai-permissions.policy.js";

export class ProjectSummaryCapability {
  static async summarize(context: AIContext, projectId: string): Promise<ProjectSummary | string | null> {
    const data = await ProjectContext.getProjectSummaryData(projectId);
    
    if (!data) return null;

    // Check Permissions
    const memberIds = data.members.map((m: any) => m.id);
    const hasAccess = AIPermissionsPolicy.canReadProject(context, memberIds, data.userId);

    if (!hasAccess) {
      return "ACCESS_DENIED: You do not have permission to view this project summary.";
    }

    const tasks = data.modules.flatMap(m => m.tasks);
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t: any) => t.status === 'COMPLETED').length;
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // financial calculations
    const totalPaid = data.payments.reduce((sum: number, p: any) => sum + p.amount, 0);
    const totalInvoiced = data.invoices.reduce((sum: number, i: any) => sum + i.amount, 0);
    const outstanding = Math.max(0, totalInvoiced - totalPaid);
    const budgetUsed = data.budget && data.budget > 0 ? (totalPaid / data.budget) * 100 : 0;
    
    let statusString = "ON_TRACK";
    if (data.endDate && new Date(data.endDate) < new Date() && progress < 100) {
      statusString = "DELAYED";
    }

    const sections: string[] = [];

    // Header section
    sections.push(`Project "${data.name}" [Status: ${statusString}]`);

    // 1. Timeline & Progress
    sections.push(`1. Timeline & Progress
   - Completion: ${Math.round(progress)}% (${completedTasks}/${totalTasks} tasks)
   - Start Date: ${new Date(data.startDate).toLocaleDateString()}
   - Target End: ${data.endDate ? new Date(data.endDate).toLocaleDateString() : 'TBD'}`);

    // 2. Financial Overview
    sections.push(`2. Financial Overview
   - Budget: ${data.budget}
   - Paid to Date: ${totalPaid} (${Math.round(budgetUsed)}% utilized)
   - Outstanding Balance: ${outstanding}
   - Invoice Status: ${data.invoices.length} total invoices issued`);

    // 3. Team & Stakeholders
    const team = data.members.map(m => `${m.name} (${m.role})`).join(", ");
    sections.push(`3. Team
   - Members: ${team || 'No members assigned'}`);

    // 4. Modules & Tasks
    const moduleDetails = data.modules.map(m => {
      const taskCount = m.tasks.length;
      const tDone = m.tasks.filter(t => t.status === 'COMPLETED').length;
      return `   - ${m.name}: ${Math.round((tDone/taskCount)*100 || 0)}% done (${tDone}/${taskCount} tasks)`;
    }).join("\n");
    sections.push(`4. Execution Details
${moduleDetails || '   - No modules defined'}`);

    // 5. Deployment & Links
    sections.push(`5. Deployment & Links
   - Free Domain: ${data.freeDomain || 'Not deployed'}
   - Custom Domain: ${data.customDomain || 'No custom domain'}`);

    // 6. Recent Activity
    const recentComments = data.comments.map(c => `   - "${c.content}" by ${c.userName} on ${new Date(c.createdAt).toLocaleDateString()}`).join("\n");
    sections.push(`6. Recent Discussions
${recentComments || '   - No recent activity'}`);

    // 7. Project Overview
    sections.push(`7. Project Description
${data.description || 'No description provided.'}`);

    const summaryText = sections.join("\n\n");

    return {
      projectId,
      summary: summaryText,
      status: statusString,
      completionPercentage: Math.round(progress)
    };
  }
}
