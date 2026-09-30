import { Request, Response, NextFunction } from "express";
import { ObjectId } from "mongodb";
import { getCollection } from "../config/database.js";
import {
  QuotationDoc,
  InvoiceDoc,
  PaymentDoc,
  ExpenseDoc,
  BoqItemDoc,
  ProjectDoc,
  ActivityLogDoc,
} from "../models/types.js";
import { sendSuccess, sendError } from "../utils/response.js";

function resolveQuery(id: string): any {
  if (ObjectId.isValid(id)) {
    return { $or: [{ _id: new ObjectId(id) }, { _id: id }] };
  }
  return { _id: id };
}

export async function getFinanceOverview(req: Request, res: Response, next: NextFunction) {
  try {
    const [invoicesCol, paymentsCol, expensesCol, quotationsCol, projectsCol] = await Promise.all([
      getCollection<InvoiceDoc>("invoices"),
      getCollection<PaymentDoc>("payments"),
      getCollection<ExpenseDoc>("expenses"),
      getCollection<QuotationDoc>("quotations"),
      getCollection<ProjectDoc>("projects"),
    ]);

    const [invoices, payments, expenses, quotations, projects] = await Promise.all([
      invoicesCol.find({}).toArray(),
      paymentsCol.find({}).toArray(),
      expensesCol.find({}).toArray(),
      quotationsCol.find({}).toArray(),
      projectsCol.find({}).toArray(),
    ]);

    const totalContractValue = projects.reduce((s, p) => s + (p.contractValue || 0), 0);
    const totalInvoiced = invoices.reduce((s, i) => s + (i.totalAmount || i.amount || 0), 0);
    const totalCollected = payments.filter((p) => p.status === "completed").reduce((s, p) => s + (p.amount || 0), 0);
    const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);
    const totalReceivables = Math.max(0, totalInvoiced - totalCollected);

    return sendSuccess(res, {
      totalContractValue,
      totalInvoiced,
      totalCollected,
      totalExpenses,
      totalReceivables,
      netCashFlow: totalCollected - totalExpenses,
      invoicesCount: invoices.length,
      quotationsCount: quotations.length,
      expensesCount: expenses.length,
    });
  } catch (err) {
    next(err);
  }
}

// QUOTATIONS
export async function listQuotations(req: Request, res: Response, next: NextFunction) {
  try {
    const { projectId } = req.query;
    const col = await getCollection<QuotationDoc>("quotations");
    const query = projectId ? { projectId } : {};
    const items = await col.find(query).sort({ createdAt: -1 }).toArray();
    return sendSuccess(res, items.map((q) => ({ ...q, id: String(q._id) })));
  } catch (err) {
    next(err);
  }
}

export async function createQuotation(req: Request, res: Response, next: NextFunction) {
  try {
    const col = await getCollection<QuotationDoc>("quotations");
    const now = new Date();
    const body = req.body;
    const count = await col.countDocuments();
    const quotationNumber = body.quotationNumber || `QUOT-2026-${String(count + 1).padStart(3, "0")}`;

    const items = Array.isArray(body.items) ? body.items : [];
    const totalAmount = items.reduce((s: number, it: any) => s + (Number(it.total) || (Number(it.rate) * Number(it.quantity)) || 0), 0);

    const doc: QuotationDoc = {
      projectId: body.projectId || body.project_id || "general",
      quotationNumber,
      version: Number(body.version) || 1,
      title: body.title || "Estimate & Scope of Work",
      clientName: body.clientName || body.client_name || "Client",
      status: body.status || "draft",
      totalAmount: totalAmount || Number(body.totalAmount || body.total_amount) || 0,
      validUntil: body.validUntil || body.valid_until || new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10),
      items,
      createdAt: now,
      updatedAt: now,
    };

    const result = await col.insertOne(doc as any);
    return sendSuccess(res, { ...doc, _id: result.insertedId, id: String(result.insertedId) }, "Quotation created.", 201);
  } catch (err) {
    next(err);
  }
}

export async function updateQuotation(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const col = await getCollection<QuotationDoc>("quotations");
    const updates = { ...req.body, updatedAt: new Date() };
    delete updates._id;
    delete updates.id;
    const result = await col.findOneAndUpdate(resolveQuery(id), { $set: updates }, { returnDocument: "after" });
    return sendSuccess(res, result, "Quotation updated.");
  } catch (err) {
    next(err);
  }
}

export async function deleteQuotation(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const col = await getCollection<QuotationDoc>("quotations");
    await col.deleteOne(resolveQuery(id));
    return sendSuccess(res, { deleted: true }, "Quotation deleted.");
  } catch (err) {
    next(err);
  }
}

// INVOICES
export async function listInvoices(req: Request, res: Response, next: NextFunction) {
  try {
    const { projectId } = req.query;
    const col = await getCollection<InvoiceDoc>("invoices");
    const query = projectId ? { projectId } : {};
    const items = await col.find(query).sort({ issuedDate: -1 }).toArray();
    return sendSuccess(res, items.map((i) => ({ ...i, id: String(i._id) })));
  } catch (err) {
    next(err);
  }
}

export async function createInvoice(req: Request, res: Response, next: NextFunction) {
  try {
    const col = await getCollection<InvoiceDoc>("invoices");
    const now = new Date();
    const body = req.body;
    const count = await col.countDocuments();
    const invoiceNumber = body.invoiceNumber || `INV-2026-${String(count + 1).padStart(3, "0")}`;

    const amount = Number(body.amount) || 0;
    const taxAmount = Number(body.taxAmount || body.tax_amount) || Math.round(amount * 0.18);
    const totalAmount = Number(body.totalAmount || body.total_amount) || (amount + taxAmount);

    const doc: InvoiceDoc = {
      projectId: body.projectId || body.project_id || "general",
      clientId: body.clientId || body.client_id || null,
      invoiceNumber,
      title: body.title || null,
      milestoneTitle: body.milestoneTitle || body.milestone_title || "Design & Procurement Milestone",
      amount,
      taxAmount,
      totalAmount,
      paidAmount: Number(body.paidAmount || body.paid_amount) || 0,
      status: body.status || "issued",
      issuedDate: body.issuedDate || body.issued_date || now.toISOString().slice(0, 10),
      dueDate: body.dueDate || body.due_date || new Date(Date.now() + 15 * 864e5).toISOString().slice(0, 10),
      pdfUrl: body.pdfUrl || body.pdf_url || null,
      driveFileId: body.driveFileId || body.drive_file_id || null,
      createdAt: now,
      updatedAt: now,
    };

    const result = await col.insertOne(doc as any);
    return sendSuccess(res, { ...doc, _id: result.insertedId, id: String(result.insertedId) }, "Invoice generated.", 201);
  } catch (err) {
    next(err);
  }
}

export async function updateInvoice(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const col = await getCollection<InvoiceDoc>("invoices");
    const updates = { ...req.body, updatedAt: new Date() };
    delete updates._id;
    delete updates.id;
    const result = await col.findOneAndUpdate(resolveQuery(id), { $set: updates }, { returnDocument: "after" });
    return sendSuccess(res, result, "Invoice updated.");
  } catch (err) {
    next(err);
  }
}

export async function deleteInvoice(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const col = await getCollection<InvoiceDoc>("invoices");
    await col.deleteOne(resolveQuery(id));
    return sendSuccess(res, { deleted: true }, "Invoice deleted.");
  } catch (err) {
    next(err);
  }
}

// PAYMENTS
export async function listPayments(req: Request, res: Response, next: NextFunction) {
  try {
    const { projectId } = req.query;
    const col = await getCollection<PaymentDoc>("payments");
    const query = projectId ? { projectId } : {};
    const items = await col.find(query).sort({ paymentDate: -1 }).toArray();
    return sendSuccess(res, items.map((p) => ({ ...p, id: String(p._id) })));
  } catch (err) {
    next(err);
  }
}

export async function createPayment(req: Request, res: Response, next: NextFunction) {
  try {
    const [paymentsCol, invoicesCol, projectsCol] = await Promise.all([
      getCollection<PaymentDoc>("payments"),
      getCollection<InvoiceDoc>("invoices"),
      getCollection<ProjectDoc>("projects"),
    ]);
    const now = new Date();
    const body = req.body;
    const amount = Number(body.amount) || 0;

    const doc: PaymentDoc = {
      projectId: body.projectId || body.project_id || "general",
      invoiceId: body.invoiceId || body.invoice_id || null,
      amount,
      paymentDate: body.paymentDate || body.payment_date || now.toISOString().slice(0, 10),
      paymentMethod: body.paymentMethod || body.payment_method || "bank_transfer",
      referenceNumber: body.referenceNumber || body.reference_number || `TXN-${Date.now()}`,
      status: body.status || "completed",
      receiptUrl: body.receiptUrl || body.receipt_url || null,
      notes: body.notes || null,
      createdAt: now,
      updatedAt: now,
    };

    const result = await paymentsCol.insertOne(doc as any);

    // Update Project collectedAmount & Invoice paidAmount
    if (body.projectId) {
      await projectsCol.updateOne(resolveQuery(body.projectId), {
        $inc: { collectedAmount: amount },
        $set: { updatedAt: now },
      });
    }

    if (body.invoiceId) {
      await invoicesCol.updateOne(resolveQuery(body.invoiceId), {
        $inc: { paidAmount: amount },
        $set: { updatedAt: now },
      });
    }

    return sendSuccess(res, { ...doc, _id: result.insertedId, id: String(result.insertedId) }, "Payment recorded.", 201);
  } catch (err) {
    next(err);
  }
}

// EXPENSES
export async function listExpenses(req: Request, res: Response, next: NextFunction) {
  try {
    const { projectId } = req.query;
    const col = await getCollection<ExpenseDoc>("expenses");
    const query = projectId ? { projectId } : {};
    const items = await col.find(query).sort({ date: -1 }).toArray();
    return sendSuccess(res, items.map((e) => ({ ...e, id: String(e._id) })));
  } catch (err) {
    next(err);
  }
}

export async function createExpense(req: Request, res: Response, next: NextFunction) {
  try {
    const col = await getCollection<ExpenseDoc>("expenses");
    const now = new Date();
    const body = req.body;

    const doc: ExpenseDoc = {
      projectId: body.projectId || body.project_id || null,
      category: body.category || "materials",
      amount: Number(body.amount) || 0,
      date: body.date || now.toISOString().slice(0, 10),
      paidTo: body.paidTo || body.paid_to || "Vendor",
      description: body.description || "Project expense",
      receiptUrl: body.receiptUrl || body.receipt_url || null,
      approvedBy: req.user?.fullName || "Studio Accounts",
      createdAt: now,
      updatedAt: now,
    };

    const result = await col.insertOne(doc as any);
    return sendSuccess(res, { ...doc, _id: result.insertedId, id: String(result.insertedId) }, "Expense recorded.", 201);
  } catch (err) {
    next(err);
  }
}

export async function deleteExpense(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const col = await getCollection<ExpenseDoc>("expenses");
    await col.deleteOne(resolveQuery(id));
    return sendSuccess(res, { deleted: true }, "Expense deleted.");
  } catch (err) {
    next(err);
  }
}

// BOQ
export async function listBoqItems(req: Request, res: Response, next: NextFunction) {
  try {
    const { projectId } = req.query;
    const col = await getCollection<BoqItemDoc>("boqItems");
    const query = projectId ? { projectId } : {};
    const items = await col.find(query).toArray();
    return sendSuccess(res, items.map((b) => ({ ...b, id: String(b._id) })));
  } catch (err) {
    next(err);
  }
}

export async function createBoqItem(req: Request, res: Response, next: NextFunction) {
  try {
    const col = await getCollection<BoqItemDoc>("boqItems");
    const now = new Date();
    const body = req.body;

    const doc: BoqItemDoc = {
      projectId: body.projectId || body.project_id || "general",
      roomId: body.roomId || body.room_id || null,
      category: body.category || "civil",
      itemCode: body.itemCode || body.item_code || `BOQ-${Date.now().toString().slice(-4)}`,
      description: body.description || "Scope specification",
      specification: body.specification || null,
      quantity: Number(body.quantity) || 1,
      unit: body.unit || "sqft",
      estimatedRate: Number(body.estimatedRate || body.estimated_rate) || 0,
      actualRate: Number(body.actualRate || body.actual_rate) || null,
      vendorId: body.vendorId || body.vendor_id || null,
      status: body.status || "specified",
      createdAt: now,
      updatedAt: now,
    };

    const result = await col.insertOne(doc as any);
    return sendSuccess(res, { ...doc, _id: result.insertedId, id: String(result.insertedId) }, "BOQ item created.", 201);
  } catch (err) {
    next(err);
  }
}
