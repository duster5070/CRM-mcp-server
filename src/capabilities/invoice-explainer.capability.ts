import { FinanceContext } from "../context/finance.context.js";
import { InvoiceExplanation, InvoiceExplanationInput, AIContext } from "../types/ai.types.js";
import { AIPermissionsPolicy } from "../policies/ai-permissions.policy.js";

export class InvoiceExplainerCapability {
  static async explain(context: AIContext, input: InvoiceExplanationInput): Promise<InvoiceExplanation | string | null> {
    const invoice = await FinanceContext.getInvoiceDetails(input.invoiceId);
    if (!invoice) return null;

    // Check Permissions (Admins or Owners only for financials)
    const hasAccess = AIPermissionsPolicy.canViewFinancials(context, invoice.project?.userId || "");

    if (!hasAccess) {
      return "ACCESS_DENIED: Only project owners or administrators can view detailed invoice explanations.";
    }
    if (!invoice) return null;

    const project = invoice.project;
    const totalInvoiced = project?.invoices.reduce((sum: number, i: any) => sum + i.amount, 0) || 0;
    const totalPaid = project?.payments.reduce((sum: number, p: any) => sum + p.amount, 0) || 0;
    
    // Calculate importance
    const percentageOfBudget = project?.budget ? (invoice.amount / project.budget) * 100 : 0;
    
    const sections = [
      `Invoice ${invoice.invoiceNumber} for Project "${project?.name || 'Unknown'}"`,
      
      `Breakdown:\n- Amount: ${invoice.amount}\n- Status: ${invoice.status}\n- Due Date: ${new Date(invoice.duedate).toLocaleDateString()}`,
      
      `Project Context:\n- This invoice represents ${Math.round(percentageOfBudget)}% of the total project budget (${project?.budget}).\n- Project Status is currently ${project?.status}.`,
      
      `Financial Lifecycle:\n- Total Invoiced so far: ${totalInvoiced}\n- Total Paid so far: ${totalPaid}\n- Outstanding Balance: ${Math.max(0, totalInvoiced - totalPaid)}`,
      
      `Summary:\nThis bill is part of the ongoing development cycle. Please ensure payment by the due date to avoid any project interruptions.`
    ];

    return {
      invoiceId: input.invoiceId,
      simpleBreakdown: sections.join("\n\n")
    };
  }
}
