import { SmartTaskInput, AIContext } from "../types/ai.types.js";
import { AIPermissionsPolicy } from "../policies/ai-permissions.policy.js";
import { AiUtilityService } from "../services/ai/ai.utility.js";
import { InputValidationError, UnauthorizedError } from "../errors/mcp.errors.js";

export class SmartTaskCapability {
  /**
   * Generates a structured list of tasks using the validated AI Utility Layer.
   */
  static async suggestTasks(context: AIContext, input: SmartTaskInput) {
    // 1. Policy & Permission Enforcement
    if (!AIPermissionsPolicy.canGenerateAiTasks(context)) {
      throw new UnauthorizedError("You do not have permission to generate AI task suggestions.");
    }

    // 2. Business Validation
    const desc = input.projectDescription.trim();
    if (desc.length < 10 || /^(test|placeholder|asdf|hello|abc)$/i.test(desc)) {
      throw new InputValidationError(
        "I need a more detailed project description to generate meaningful tasks. " +
        "Please describe the industry, goals, and core features of your project."
      );
    }

    // 3. Delegation to Strict Utility Layer
    return await AiUtilityService.generateValidatedTasks(
      desc, 
      input.moduleCount || 3
    );
  }
}
