export type UserRole = 'ADMIN' | 'USER' | 'CLIENT' | 'MEMBER';

export interface AIContext {
  userId: string;
  role: UserRole;
}

export interface McpToolResponse {
  content: Array<{ type: "text"; text: string }>;
}

export interface ProjectSummaryInput {
  projectId: string;
}

export interface RiskAnalysisInput {
  projectId: string;
}

export interface SmartTaskInput {
  projectDescription: string;
  moduleCount?: number;
}

export interface EmailGenerationInput {
  projectId: string;
  recipientName: string;
  emailType: 'REMINDER' | 'UPDATE' | 'PAYMENT_REQUEST';
  tone: 'FORMAL' | 'FRIENDLY';
}

export interface InvoiceExplanationInput {
  invoiceId: string;
}

// Output Types

export interface ProjectSummary {
  projectId: string;
  summary: string;
  status: string; // 'ON_TRACK' | 'AT_RISK' | 'DELAYED'
  completionPercentage: number;
}

export interface RiskReport {
  projectId: string;
  delayProbability: number; // 0-1
  budgetHealth: 'HEALTHY' | 'OVER_BUDGET' | 'UNDER_BUDGET';
  recommendations: string[];
}

export interface Generatedemail {
  subject: string;
  body: string;
}

export interface InvoiceExplanation {
  invoiceId: string;
  simpleBreakdown: string;
}
