import { prisma } from "../db.js";

export class FinanceContext {
  static async getInvoiceDetails(invoiceId: string) {
    return prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        project: {
          select: { 
            name: true,
            description: true,
            status: true,
            budget: true,
            id: true,
            userId: true, // Owner
            clientId: true, // Client
            members: { select: { id: true } }, // Members
            invoices: { select: { amount: true } },
            payments: { select: { amount: true } }
          }
        }, 
        user: {
          select: { name: true, email: true }
        }
      }
    });
  }

  static async getProjectFinancials(projectId: string) {
    return prisma.project.findUnique({
      where: { id: projectId },
      select: {
        budget: true,
        invoices: {
          select: {
            id: true,
            amount: true,
            status: true,
            duedate: true
          }
        },
        payments: {
          select: {
            id: true,
            amount: true,
            date: true
          }
        }
      }
    });
  }
}
