import { z } from "zod";
import { SmartTaskCapability } from "../capabilities/smart-task.capability.js";
import { EmailGeneratorCapability } from "../capabilities/email-generator.capability.js";
import { AIContext } from "../types/ai.types.js";

export const suggestTasksTool = {
  name: "suggest_tasks",
  description: "Generate suggested modules and tasks for a new project.",
  inputSchema: z.object({
    projectDescription: z.string(),
    moduleCount: z.number().optional(),
  }),
  handler: async (context: AIContext, args: { projectDescription: string; moduleCount?: number }) => {
    return await SmartTaskCapability.suggestTasks(context, args);
  },
};

export const generateEmailTool = {
  name: "generate_email_draft",
  description: "Generate a draft email for a client or team member.",
  inputSchema: z.object({
    projectId: z.string(),
    recipientName: z.string(),
    emailType: z.enum(['REMINDER', 'UPDATE', 'PAYMENT_REQUEST']),
    tone: z.enum(['FORMAL', 'FRIENDLY']),
  }),
  handler: async (context: AIContext, args: any) => {
    return await EmailGeneratorCapability.generate(context, args);
  },
};
