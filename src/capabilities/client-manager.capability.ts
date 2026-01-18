import { ClientContext } from "../context/index.js";
import { AIContext } from "../types/ai.types.js";

export class ClientManagerCapability {
  /**
   * Get all clients for the user
   */
  static async getUserClients(context: AIContext) {
    const clients = await ClientContext.getUserClients(context.userId);

    return {
      count: clients.length,
      clients: clients.map(c => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        companyName: c.companyName,
        status: c.status,
      })),
    };
  }

  /**
   * Get recent clients
   */
  static async getRecentClients(context: AIContext, limit: number = 5) {
    const clients = await ClientContext.getRecentUserClients(context.userId, limit);

    return {
      count: clients.length,
      clients: clients.map(c => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        companyName: c.companyName,
        status: c.status,
      })),
    };
  }

  /**
   * Get client project history
   */
  static async getClientHistory(context: AIContext, clientId: string) {
    const projects = await ClientContext.getClientProjectHistory(context.userId, clientId);

    return {
      clientId,
      projectCount: projects.length,
      projects: projects.map(p => ({
        id: p.id,
        name: p.name,
        status: p.status,
        budget: p.budget,
        startDate: p.startDate,
        endDate: p.endDate,
      })),
    };
  }
}
