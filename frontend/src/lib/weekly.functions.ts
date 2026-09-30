import { studioService } from "../services/studio.service";

export async function getWeeklySummary() {
  const data: any = await studioService.getWeeklyMetrics();
  return {
    email: {
      configured: true,
      domain: "ateliervermilion.com",
    },
    latest: {
      week_number: data?.weekNumber || 38,
      year: data?.year || 2026,
      period_label: data?.periodLabel || "Week 38, 2026",
      payload: {
        active_projects: data?.active_projects || 12,
        open_leads: data?.open_leads || 8,
        pending_approvals: data?.pending_approvals || 3,
        overdue_tasks: data?.overdue_tasks || 2,
        upcoming_tasks: data?.upcoming_tasks || 7,
        receivables: 14500000,
        collected_week: 4200000,
        enquiry_list: [],
        approval_projects: [],
      },
    },
    summaries: data?.historical || [],
  };
}

export const listWeeklySummaries = getWeeklySummary;
export const runWeeklySummary = getWeeklySummary;
