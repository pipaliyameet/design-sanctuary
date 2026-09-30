import { Router } from "express";
import {
  getFinanceOverview,
  listQuotations,
  createQuotation,
  updateQuotation,
  deleteQuotation,
  listInvoices,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  listPayments,
  createPayment,
  listExpenses,
  createExpense,
  deleteExpense,
  listBoqItems,
  createBoqItem,
} from "../controllers/finance.controller.js";
import { requireAuth, requireStaff } from "../middleware/role.middleware.js";

const router = Router();

router.get("/overview", requireAuth, requireStaff, getFinanceOverview);

// Quotations
router.get("/quotations", requireAuth, requireStaff, listQuotations);
router.post("/quotations", requireAuth, requireStaff, createQuotation);
router.patch("/quotations/:id", requireAuth, requireStaff, updateQuotation);
router.delete("/quotations/:id", requireAuth, requireStaff, deleteQuotation);

// Invoices
router.get("/invoices", requireAuth, requireStaff, listInvoices);
router.post("/invoices", requireAuth, requireStaff, createInvoice);
router.patch("/invoices/:id", requireAuth, requireStaff, updateInvoice);
router.delete("/invoices/:id", requireAuth, requireStaff, deleteInvoice);

// Payments
router.get("/payments", requireAuth, requireStaff, listPayments);
router.post("/payments", requireAuth, requireStaff, createPayment);

// Expenses
router.get("/expenses", requireAuth, requireStaff, listExpenses);
router.post("/expenses", requireAuth, requireStaff, createExpense);
router.delete("/expenses/:id", requireAuth, requireStaff, deleteExpense);

// BOQ
router.get("/boq", requireAuth, requireStaff, listBoqItems);
router.post("/boq", requireAuth, requireStaff, createBoqItem);

export default router;
