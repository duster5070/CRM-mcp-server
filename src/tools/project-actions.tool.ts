import { z } from "zod";
import { SmartTaskCapability } from "../capabilities/smart-task.capability.js";
import { EmailGeneratorCapability } from "../capabilities/email-generator.capability.js";
import { ProjectManagerCapability } from "../capabilities/project-manager.capability.js";
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

export const createProjectTool = {
  name: "create_project",
  description: "Create a new project with specified details.",
  inputSchema: z.object({
    name: z.string().describe("The name of the project"),
    description: z.string().optional().describe("Project description"),
    clientId: z.string().describe("The ID of the client for this project"),
    budget: z.number().optional().describe("Project budget in dollars"),
    startDate: z.string().optional().describe("Project start date (ISO format)"),
    endDate: z.string().optional().describe("Project end date (ISO format)"),
  }),
  handler: async (context: AIContext, args: {
    name: string;
    description?: string;
    clientId: string;
    budget?: number;
    startDate?: string;
    endDate?: string;
  }) => {
    const data = {
      name: args.name,
      description: args.description,
      clientId: args.clientId,
      budget: args.budget,
      startDate: args.startDate ? new Date(args.startDate) : undefined,
      endDate: args.endDate ? new Date(args.endDate) : undefined,
    };
    return await ProjectManagerCapability.createProject(context, data);
  },
};

export const deleteProjectTool = {
  name: "delete_project",
  description: "Delete a project. Only the project owner can perform this action.",
  inputSchema: z.object({
    projectId: z.string().describe("The ID of the project to delete"),
  }),
  handler: async (context: AIContext, { projectId }: { projectId: string }) => {
    return await ProjectManagerCapability.deleteProject(context, projectId);
  },
};

export const updateTaskStatusTool = {
  name: "update_task_status",
  description: "Update the status of a task (TODO, INPROGRESS, or COMPLETED).",
  inputSchema: z.object({
    taskId: z.string().describe("The ID of the task to update"),
    status: z.enum(['TODO', 'INPROGRESS', 'COMPLETED']).describe("The new status for the task"),
  }),
  handler: async (context: AIContext, { taskId, status }: { taskId: string; status: 'TODO' | 'INPROGRESS' | 'COMPLETED' }) => {
    return await ProjectManagerCapability.updateTaskStatus(context, taskId, status);
  },
};
