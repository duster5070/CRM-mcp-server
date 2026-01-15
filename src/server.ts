import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import dotenv from "dotenv";

dotenv.config();

/**
 * Production Environment Validation
 */
function validateEnv() {
  const required = ["DATABASE_URL", "GEMINI_API_KEY"];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error(`FATAL: Missing required environment variables: ${missing.join(", ")}`);
    process.exit(1);
  }
}

validateEnv();

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
import { McpError, McpErrorCode } from "./errors/mcp.errors.js";

const app = express();

/**
 * Standardized Context Extraction (Dynamic for Multi-User)
 */
function getRequestContext(req?: express.Request): AIContext {
  // In Production (Next.js calling Vercel), we'll pass the User ID in headers
  const headerUserId = req?.headers["x-user-id"] as string;
  const headerRole = req?.headers["x-user-role"] as string;

  return {
    userId: headerUserId || process.env.MOCKED_USER_ID || "user_2ovv7H6vY81mP5r9",
    role: (headerRole || process.env.MOCKED_USER_ROLE || "ADMIN") as any,
  };
}

/**
 * Centralized Tool Registration
 */
function registerMcpTool(tool: any) {
  server.registerTool(
    tool.name,
    { description: tool.description, inputSchema: tool.inputSchema },
    async (args: any, extra: any) => {
      try {
        // 'extra' contains transport-specific info. 
        // For Streamable HTTP, we can potentially find the request here.
        const req = extra?.req as express.Request | undefined;
        const context = getRequestContext(req);
        
        const result = await tool.handler(context, args);
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }]
        };
      } catch (error: any) {
        // More robust McpError detection
        const isMcpError = error instanceof McpError || (error.code && error.message && typeof error.code === 'number');
        
        if (isMcpError) {
          return {
            content: [{
              type: "text" as const,
              text: JSON.stringify({
                status: "error",
                code: error.code,
                message: error.message,
                data: error.data
              }, null, 2)
            }],
            isError: true,
          };
        }

        // Generic fallback for unexpected errors with descriptive logs
        console.error(`[DEBUG] Unexpected error in tool ${tool.name}:`, error);
        
        const errorMessage = error instanceof Error ? error.message : "An internal error occurred";
        const errorStack = error instanceof Error ? error.stack : undefined;

        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({
              status: "error",
              code: McpErrorCode.INTERNAL_ERROR,
              message: process.env.NODE_ENV === "production" ? "An internal error occurred" : errorMessage,
              debug: process.env.NODE_ENV === "production" ? undefined : {
                stack: errorStack,
                tool: tool.name,
                args
              }
            }, null, 2)
          }],
          isError: true,
        };
      }
    }
  );
}

// Register all tools
registerMcpTool(getProjectSummaryTool);
registerMcpTool(getProjectRiskTool);
registerMcpTool(suggestTasksTool);
registerMcpTool(generateEmailTool);
registerMcpTool(explainInvoiceTool);

// --- HTTP SERVER SETUP ---

// Heartbeat / Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Streamable HTTP Transport
const transport = new StreamableHTTPServerTransport();

// The MCP Spec for Streamable HTTP expects POST and GET on the same endpoint
app.all("/mcp", async (req, res) => {
  await transport.handleRequest(req, res);
});

async function main() {
  const transportMode = process.env.TRANSPORT || "stdio";

  if (transportMode === "http") {
    const port = process.env.PORT || 3000;
    await server.connect(transport);

    // Only start the listener if we're not being imported (Vercel imports the app)
    if (process.env.NODE_ENV !== "production") {
      app.listen(port, () => {
        console.error(`CRM AI Agent MCP Server running on Streamable HTTP at http://localhost:${port}/mcp`);
      });
    }
  } else {
    // Standard local stdio transport
    const stdioTransport = new StdioServerTransport();
    await server.connect(stdioTransport);
    console.error("CRM AI Agent MCP Server running on stdio");
  }
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});

// Export for Vercel Serverless
export default app;
