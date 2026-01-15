export class ProjectSummaryPrompt {
  static format(data: any, progress: number, totalPaid: number, budgetUsed: number, outstanding: number, statusString: string): string {
    const sections: string[] = [];

    // Header section
    sections.push(`Project "${data.name}" [Status: ${statusString}]`);

    // 1. Timeline & Progress
    const completedTasks = data.modules.flatMap((m: any) => m.tasks).filter((t: any) => t.status === 'COMPLETED').length;
    const totalTasks = data.modules.flatMap((m: any) => m.tasks).length;

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
    const team = data.members.map((m: any) => `${m.name} (${m.role})`).join(", ");
    sections.push(`3. Team
   - Members: ${team || 'No members assigned'}`);

    // 4. Execution Details
    const moduleDetails = data.modules.map((m: any) => {
      const taskCount = m.tasks.length;
      const tDone = m.tasks.filter((t: any) => t.status === 'COMPLETED').length;
      return `   - ${m.name}: ${Math.round((tDone/taskCount)*100 || 0)}% done (${tDone}/${taskCount} tasks)`;
    }).join("\n");
    sections.push(`4. Execution Details
${moduleDetails || '   - No modules defined'}`);

    // 5. Deployment & Links
    sections.push(`5. Deployment & Links
   - Free Domain: ${data.freeDomain || 'Not deployed'}
   - Custom Domain: ${data.customDomain || 'No custom domain'}`);

    // 6. Recent Activity
    const recentComments = data.comments.map((c: any) => `   - "${c.content}" by ${c.userName} on ${new Date(c.createdAt).toLocaleDateString()}`).join("\n");
    sections.push(`6. Recent Discussions
${recentComments || '   - No recent activity'}`);

    // 7. Project Overview
    sections.push(`7. Project Description
${data.description || 'No description provided.'}`);

    return sections.join("\n\n");
  }
}
