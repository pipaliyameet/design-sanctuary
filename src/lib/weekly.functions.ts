import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type WeeklyPayload = {
  active_projects?: number;
  projects_by_stage?: Record<string, number>;
  new_enquiries?: number;
  new_leads?: number;
  open_leads?: number;
  pending_approvals?: number;
  overdue_tasks?: number;
  upcoming_tasks?: number;
  receivables?: number;
  collected_week?: number;
  enquiry_list?: Array<{
    id: string;
    name: string;
    city: string | null;
    space_type: string | null;
    budget_band: string | null;
    status: string;
    created_at: string;
  }>;
  approval_projects?: Array<{
    project_id: string;
    title: string;
    code: string;
    client: string;
    pending: number;
  }>;
};

/** Managed transactional email is only usable with a verified sending domain.
 *  Until one is configured the digest is compiled and stored in-app only. */
function emailDeliveryState() {
  const domain = process.env["LOVABLE_EMAIL_SENDING_DOMAIN"];
  return {
    configured: Boolean(domain),
    domain: domain ?? null,
  };
}

export const listWeeklySummaries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("weekly_summaries")
      .select("id, week_start, generated_at, payload, delivery_status, delivery_note")
      .order("week_start", { ascending: false })
      .limit(12);
    if (error) throw new Error(error.message);
    return {
      summaries: (data ?? []).map((row) => ({
        ...row,
        payload: (row.payload ?? {}) as WeeklyPayload,
      })),
      email: emailDeliveryState(),
    };
  });

export const runWeeklySummary = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { error } = await supabase.rpc("generate_weekly_summary");
    if (error) throw new Error(error.message);
    return { ok: true, email: emailDeliveryState() };
  });
