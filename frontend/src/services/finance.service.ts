import { api } from "./api";
import { QuotationItem, InvoiceItem, PaymentItem, ExpenseItem, BoqItem } from "../types/api";

export const financeService = {
  async getOverview(): Promise<{
    totalContractValue: number;
    totalInvoiced: number;
    totalCollected: number;
    totalExpenses: number;
    totalReceivables: number;
    netCashFlow: number;
  }> {
    return api.get("/finance/overview");
  },

  // Quotations
  async listQuotations(params?: { projectId?: string }): Promise<QuotationItem[]> {
    return api.get<QuotationItem[]>("/finance/quotations", params);
  },
  async createQuotation(data: Partial<QuotationItem>): Promise<QuotationItem> {
    return api.post<QuotationItem>("/finance/quotations", data);
  },
  async updateQuotation(id: string, data: Partial<QuotationItem>): Promise<QuotationItem> {
    return api.patch<QuotationItem>(`/finance/quotations/${id}`, data);
  },
  async deleteQuotation(id: string): Promise<{ deleted: boolean }> {
    return api.delete(`/finance/quotations/${id}`);
  },

  // Invoices
  async listInvoices(params?: { projectId?: string }): Promise<InvoiceItem[]> {
    return api.get<InvoiceItem[]>("/finance/invoices", params);
  },
  async createInvoice(data: Partial<InvoiceItem>): Promise<InvoiceItem> {
    return api.post<InvoiceItem>("/finance/invoices", data);
  },
  async updateInvoice(id: string, data: Partial<InvoiceItem>): Promise<InvoiceItem> {
    return api.patch<InvoiceItem>(`/finance/invoices/${id}`, data);
  },
  async deleteInvoice(id: string): Promise<{ deleted: boolean }> {
    return api.delete(`/finance/invoices/${id}`);
  },

  // Payments
  async listPayments(params?: { projectId?: string }): Promise<PaymentItem[]> {
    return api.get<PaymentItem[]>("/finance/payments", params);
  },
  async createPayment(data: Partial<PaymentItem>): Promise<PaymentItem> {
    return api.post<PaymentItem>("/finance/payments", data);
  },

  // Expenses
  async listExpenses(params?: { projectId?: string }): Promise<ExpenseItem[]> {
    return api.get<ExpenseItem[]>("/finance/expenses", params);
  },
  async createExpense(data: Partial<ExpenseItem>): Promise<ExpenseItem> {
    return api.post<ExpenseItem>("/finance/expenses", data);
  },
  async deleteExpense(id: string): Promise<{ deleted: boolean }> {
    return api.delete(`/finance/expenses/${id}`);
  },

  // BOQ
  async listBoq(params?: { projectId?: string }): Promise<BoqItem[]> {
    return api.get<BoqItem[]>("/finance/boq", params);
  },
  async createBoq(data: Partial<BoqItem>): Promise<BoqItem> {
    return api.post<BoqItem>("/finance/boq", data);
  },
};
