import { z } from "zod";
import { InvoiceExplainerCapability } from "../capabilities/invoice-explainer.capability.js";
import { AIContext } from "../types/ai.types.js";

export const explainInvoiceTool = {
  name: "explain_invoice",
  description: "Explain the details of an invoice in simple terms.",
  inputSchema: z.object({
    invoiceId: z.string(),
  }),
  handler: async (context: AIContext, { invoiceId }: { invoiceId: string }) => {
    return await InvoiceExplainerCapability.explain(context, { invoiceId });
  },
};
