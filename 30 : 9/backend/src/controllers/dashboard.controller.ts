import { Request, Response, NextFunction } from "express";
import { getCollection } from "../config/database.js";
import {
  ProjectDoc,
  LeadDoc,
  EnquiryDoc,
  ApprovalDoc,
  TaskDoc,
  PaymentDoc,
  WeeklySummaryDoc,
} from "../models/types.js";
import { sendSuccess } from "../utils/response.js";

export async function getDashboardOverview(req: Request, res: Response, next: NextFunction) {
  try {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 864e5);
    const in7Days = new Date(today.getTime() + 7 * 864e5);

    const [projectsCol, enquiriesCol, leadsCol, approvalsCol, tasksCol, paymentsCol, activityCol] = await Promise.all([
      getCollection<ProjectDoc>("projects"),
      getCollection<EnquiryDoc>("enquiries"),
      getCollection<LeadDoc>("leads"),
      getCollection<ApprovalDoc>("approvals"),
      getCollection<TaskDoc>("tasks"),
      getCollection<PaymentDoc>("payments"),
      getCollection<any>("activityLogs"),
    ]);

    const [
      activeProjectsCount,
      allProjects,
      newEnquiriesCount,
      openLeads,
      pendingApprovals,
      tasks,
      recentPayments,
      recentActivity,
    ] = await Promise.all([
      projectsCol.countDocuments({ status: { $nin: ["completed", "archived", "on_hold"] } }),
      projectsCol.find({}).toArray(),
      enquiriesCol.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      leadsCol.find({ status: { $nin: ["won", "lost"] } }).toArray(),
      approvalsCol.find({ status: "pending" }).toArray(),
      tasksCol.find({ status: { $ne: "done" } }).toArray(),
      paymentsCol.find({ status: "completed" }).sort({ paymentDate: -1 }).limit(10).toArray(),
      activityCol.find({}).sort({ createdAt: -1 }).limit(10).toArray(),
    ]);

    const totalContractValue = allProjects.reduce((s, p) => s + (p.contractValue || 0), 0);
    const totalCollected = allProjects.reduce((s, p) => s + (p.collectedAmount || 0), 0);
    const totalReceivables = Math.max(0, totalContractValue - totalCollected);

    const overdueTasks = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < today).length;
    const upcomingTasks = tasks.filter((t) => t.dueDate && new Date(t.dueDate) >= today && new Date(t.dueDate) <= in7Days).length;

    // Stage counts
    const stageCounts: Record<string, number> = {
      concept: 0,
      design: 0,
      procurement: 0,
      execution: 0,
      handover: 0,
    };
    for (const p of allProjects) {
      const st = p.status || "concept";
      if (stageCounts[st] !== undefined) {
        stageCounts[st]++;
      }
    }

    return sendSuccess(res, {
      stats: {
        activeProjects: activeProjectsCount,
        newEnquiries: newEnquiriesCount,
        openLeads: openLeads.length,
        leadPipelineValue: openLeads.reduce((s, l) => s + (l.estimatedValue || 0), 0),
        pendingApprovals: pendingApprovals.length,
        overdueTasks,
        upcomingTasks,
        totalContractValue,
        totalCollected,
        receivables: totalReceivables,
        collectedMonth: recentPayments.reduce((s, p) => s + (p.amount || 0), 0),
      },
      stageCounts,
      recentProjects: allProjects.slice(0, 5).map((p) => ({ ...p, id: String(p._id) })),
      pendingApprovals: pendingApprovals.slice(0, 5).map((a) => ({ ...a, id: String(a._id) })),
      recentActivity: recentActivity.map((a) => ({ ...a, id: String(a._id) })),
    });
  } catch (err) {
    next(err);
  }
}

export async function getWeeklyMetrics(req: Request, res: Response, next: NextFunction) {
  try {
    const weeklyCol = await getCollection<WeeklySummaryDoc>("weeklySummaries");
    const summaries = await weeklyCol.find({}).sort({ year: -1, weekNumber: -1 }).limit(12).toArray();

    // Compute live current week snapshot
    const now = new Date();
    const [projectsCol, leadsCol, enquiriesCol, approvalsCol, tasksCol, paymentsCol] = await Promise.all([
      getCollection<ProjectDoc>("projects"),
      getCollection<LeadDoc>("leads"),
      getCollection<EnquiryDoc>("enquiries"),
      getCollection<ApprovalDoc>("approvals"),
      getCollection<TaskDoc>("tasks"),
      getCollection<PaymentDoc>("payments"),
    ]);

    const [activeProjects, openLeads, pendingApprovals, allTasks] = await Promise.all([
      projectsCol.find({ status: { $nin: ["completed", "archived"] } }).toArray(),
      leadsCol.find({ status: "active" }).toArray(),
      approvalsCol.find({ status: "pending" }).toArray(),
      tasksCol.find({ status: { $ne: "done" } }).toArray(),
    ]);

    const liveWeekly = {
      weekNumber: getISOWeek(now),
      year: now.getFullYear(),
      periodLabel: `Week ${getISOWeek(now)}, ${now.getFullYear()}`,
      active_projects: activeProjects.length,
      open_leads: openLeads.length,
      pending_approvals: pendingApprovals.length,
      overdue_tasks: allTasks.filter((t) => t.dueDate && new Date(t.dueDate) < now).length,
      upcoming_tasks: allTasks.filter((t) => t.dueDate && new Date(t.dueDate) >= now).length,
      historical: summaries,
    };

    return sendSuccess(res, liveWeekly);
  } catch (err) {
    next(err);
  }
}

function getISOWeek(d: Date) {
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
}
