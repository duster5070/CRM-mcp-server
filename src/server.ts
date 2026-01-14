import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import dotenv from "dotenv";

dotenv.config();

// Create an MCP server instance
const server = new McpServer({
  name: "CRM AI Agent",
  version: "1.0.0",
});

import { 
  getProjectSummaryTool, 
  getProjectRiskTool, 
  suggestTasksTool, 
  generateEmailTool, 
  explainInvoiceTool 
} from "./tools/index.js";
import { AIContext } from "./types/ai.types.js";


/**
 * Senior Refactor: Standardized Context Extraction
 * In a real-world scenario, this might extract identity from the transport layer
 * or environmental variables set by the parent application.
 */
function getRequestContext(): AIContext {
  return {
    userId: process.env.MOCKED_USER_ID || "user_2ovv7H6vY81mP5r9", // Default dev user
    role: (process.env.MOCKED_USER_ROLE as any) || "ADMIN",
  };
}

/**
 * Senior Refactor: Centralized Tool Registration
 * This reduces boilerplate from ~10 lines per tool to a single function call.
 */
function registerMcpTool(tool: any) {
  server.registerTool(
    tool.name,
    { description: tool.description, inputSchema: tool.inputSchema },
    async (args: any) => {
      const context = getRequestContext();
      const result = await tool.handler(context, args);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }]
      };
    }
  );
}

// Register all tools using the new pattern
registerMcpTool(getProjectSummaryTool);
registerMcpTool(getProjectRiskTool);
registerMcpTool(suggestTasksTool);
registerMcpTool(generateEmailTool);
registerMcpTool(explainInvoiceTool);


async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("CRM AI Agent MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
