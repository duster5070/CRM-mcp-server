import { z } from "zod";
import { ClientManagerCapability } from "../capabilities/client-manager.capability.js";
import { AIContext } from "../types/ai.types.js";

export const getUserClientsTool = {
  name: "get_user_clients",
  description: "Get all clients associated with the user's projects.",
  inputSchema: z.object({}),
  handler: async (context: AIContext) => {
    return await ClientManagerCapability.getUserClients(context);
  },
};

export const getRecentClientsTool = {
  name: "get_recent_clients",
  description: "Get recently active clients (based on project creation).",
  inputSchema: z.object({
    limit: z.number().optional().describe("Number of recent clients to return (default: 5)"),
  }),
  handler: async (context: AIContext, { limit }: { limit?: number }) => {
    return await ClientManagerCapability.getRecentClients(context, limit);
  },
};

export const getClientHistoryTool = {
  name: "get_client_history",
  description: "Get project history for a specific client.",
  inputSchema: z.object({
    clientId: z.string().describe("The ID of the client"),
  }),
  handler: async (context: AIContext, { clientId }: { clientId: string }) => {
    return await ClientManagerCapability.getClientHistory(context, clientId);
  },
};
