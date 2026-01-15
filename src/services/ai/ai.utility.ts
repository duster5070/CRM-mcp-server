import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { InputValidationError, McpError, McpErrorCode } from "../../errors/mcp.errors.js";

/**
 * Strict Schema for Smart Task Generation
 */
export const SmartTaskSchema = z.array(z.object({
  name: z.string().describe("The name of the module"),
  tasks: z.array(z.string()).describe("List of actionable tasks for this module")
}));

export type ValidatedSmartTasks = z.infer<typeof SmartTaskSchema>;

export class AiUtilityService {
  private static genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

  /**
   * Generates a structured project plan with strict schema validation.
   */
  static async generateValidatedTasks(description: string, moduleCount: number = 3): Promise<ValidatedSmartTasks> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new McpError(McpErrorCode.INTERNAL_ERROR, "GEMINI_API_KEY is not configured.");
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
        As a technical project management utility, decompose the following project description into a structured JSON plan.
        
        Project: "${description}"
        
        Constraints:
        - Quantity: Exactly ${moduleCount} modules.
        - Structure: Return a JSON array of objects with "name" (string) and "tasks" (array of strings).
        - Quality: Tasks must be actionable technical steps.
        - NO explanation, NO citations, NO markdown formatting outside the JSON block.
        
        JSON schema requirement:
        ${JSON.stringify(SmartTaskSchema.description, null, 2)}
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text().trim();

      // Senior Sanitization: Remove potential markdown wrappers
      if (text.startsWith("```")) {
        text = text.replace(/^```json|```$/g, "").trim();
      }

      // 1. Parsing
      const rawData = JSON.parse(text);

      // 2. Strict Validation (Hallucination Control)
      const validatedData = SmartTaskSchema.safeParse(rawData);

      if (!validatedData.success) {
        console.error("AI Validation Error:", validatedData.error);
        throw new McpError(McpErrorCode.INTERNAL_ERROR, "AI output did not match required business schema.");
      }

      return validatedData.data;

    } catch (error) {
      if (error instanceof McpError) throw error;
      
      console.error("AiUtilityService Error:", error);
      throw new McpError(
        McpErrorCode.INTERNAL_ERROR, 
        "Failed to generate structured plan. Please try a more specific description."
      );
    }
  }
}
