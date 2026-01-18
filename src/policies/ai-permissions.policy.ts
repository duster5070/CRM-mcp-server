import { AIContext } from '../types/ai.types.js';

export class AIPermissionsPolicy {
  /**
   * Check if a user can read project details (Summary, Tasks, Modules)
   */
  static canReadProject(context: AIContext, auth: { isOwner: boolean; isClient: boolean; isMember: boolean }): boolean {
    // Owner, Client, and Member can all read project details
    return auth.isOwner || auth.isClient || auth.isMember;
  }

  /**
   * Check if a user can create/modify core project data (Tasks, Modules, Payments)
   */
  static canModifyCoreData(context: AIContext, auth: { isOwner: boolean }): boolean {
    // Only the Project Owner (USER role in business terms) can manage core entities
    return auth.isOwner;
  }

  /**
   * Check if a user can see sensitive financials (Invoices, Budget Details)
   */
  static canViewFinancials(context: AIContext, auth: { isOwner: boolean; isClient: boolean }): boolean {
    // Owners always see financials. Clients see them (their own invoices).
    return auth.isOwner || auth.isClient;
  }

  /**
   * Check if a user can add persistent notes or comments
   */
  static canAddComments(context: AIContext, auth: { isOwner: boolean; isClient: boolean; isMember: boolean }): boolean {
    // Everyone involved in the project can contribute to discussions
    return auth.isOwner || auth.isClient || auth.isMember;
  }

  /**
   * Check if a user can generate AI content (General permission)
   */
  static canGenerateAiTasks(context: AIContext, auth?: { isOwner: boolean }): boolean {
    // If we have specific project auth, check if they are the owner
    if (auth) return auth.isOwner;

    // For general generation (new projects), only the 'USER' (owner role) or 'ADMIN' can trigger this
    return ['ADMIN', 'USER'].includes(context.role);
  }

  /**
   * Check if user can create a new project
   */
  static canCreateProject(context: AIContext): boolean {
    return ['ADMIN', 'USER'].includes(context.role);
  }

  /**
   * Check if user can delete a project
   */
  static canDeleteProject(context: AIContext, auth: { isOwner: boolean }): boolean {
    return auth.isOwner;
  }
}
