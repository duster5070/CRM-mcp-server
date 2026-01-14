import { AIContext } from '../types/ai.types.js';

export class AIPermissionsPolicy {
  /**
   * Check if a user can read a project summary/details
   */
  static canReadProject(context: AIContext, projectMemberIds: string[], projectOwnerId: string): boolean {
    if (context.role === 'ADMIN') return true;
    if (context.userId === projectOwnerId) return true;
    if (projectMemberIds.includes(context.userId)) return true;
    return false;
  }

  /**
   * Check if a user can mutate project data (tasks, invoices, etc)
   */
  static canMutateProject(context: AIContext, projectOwnerId: string): boolean {
    if (context.role === 'ADMIN') return true;
    if (context.userId === projectOwnerId) return true;
    return false;
  }

  /**
   * Check if a user can see sensitive financial data
   */
  static canViewFinancials(context: AIContext, projectOwnerId: string): boolean {
    // Only Admins and Project Owners should see deep financials
    if (context.role === 'ADMIN') return true;
    if (context.userId === projectOwnerId) return true;
    return false;
  }

  /**
   * Check if a user can generate AI content (General permission)
   */
  static canGenerateContent(context: AIContext): boolean {
    // We might restrict this to paid users later
    return ['ADMIN', 'USER', 'MEMBER'].includes(context.role);
  }
}
