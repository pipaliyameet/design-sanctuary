import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Every function here runs as the signed-in user, so RLS decides visibility.
 *  Staff policies (is_staff) already restrict these tables to studio members. */

async function assertStaff(supabase: unknown, userId: string) {
  const client = supabase as {
    rpc: (fn: "is_staff", args: { _user_id: string }) => PromiseLike<{ data: boolean | null }>;
  };
  const { data } = await client.rpc("is_staff", { _user_id: userId });
  if (!data) throw new Error("Studio access only.");
  return true;
}

export const getStudioDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertStaff(supabase, userId);

    const today = new Date();
    const iso = (d: Date) => d.toISOString().slice(0, 10);
    const in7 = new Date(today.getTime() + 7 * 864e5);
    const since = new Date(today.getTime() - 7 * 864e5).toISOString();

    const [
      projects,
      enquiries,
      leads,
      approvals,
      overdue,
      upcoming,
      invoices,
      payments,
      activity,
    ] = await Promise.all([
      supabase.from("projects").select("id, title, code, stage, progress, city, target_date, lead_designer_name, is_active"),
      supabase.from("enquiries").select("id, name, city, space_type, budget_band, status, created_at").gte("created_at", since).order("created_at", { ascending: false }),
      supabase.from("leads").select("id, name, stage, value_estimate, created_at"),
      supabase.from("approvals").select("id, title, status, requested_at, project_id, projects(title, code)").eq("status", "pending").order("requested_at", { ascending: true }).limit(12),
      supabase.from("tasks").select("id, title, due_date, status, priority, assignee_name, project_id, projects(title, code)").neq("status", "done").lt("due_date", iso(today)).order("due_date", { ascending: true }).limit(12),
      supabase.from("tasks").select("id, title, due_date, status, priority, assignee_name, project_id, projects(title, code)").neq("status", "done").gte("due_date", iso(today)).lte("due_date", iso(in7)).order("due_date", { ascending: true }).limit(12),
      supabase.from("invoices").select("total, amount_paid, status"),
      supabase.from("payments").select("amount, paid_at").gte("paid_at", iso(new Date(today.getTime() - 30 * 864e5))),
      supabase.from("activity_log").select("id, action, entity, actor_label, detail, created_at").order("created_at", { ascending: false }).limit(14),
    ]);

    const allProjects = projects.data ?? [];
    const active = allProjects.filter((p) => p.is_active);
    const stageCounts: Record<string, number> = {};
    for (const p of active) stageCounts[p.stage] = (stageCounts[p.stage] ?? 0) + 1;

    const inv = invoices.data ?? [];
    const receivables = inv
      .filter((i) => i.status !== "draft")
      .reduce((s, i) => s + (Number(i.total) - Number(i.amount_paid)), 0);
    const overdueValue = inv
      .filter((i) => i.status === "overdue")
      .reduce((s, i) => s + (Number(i.total) - Number(i.amount_paid)), 0);

    const openLeads = (leads.data ?? []).filter((l) => l.stage !== "won" && l.stage !== "lost");

    return {
      kpis: {
        activeProjects: active.length,
        totalProjects: allProjects.length,
        newEnquiries: (enquiries.data ?? []).length,
        openLeads: openLeads.length,
        pipelineValue: openLeads.reduce((s, l) => s + Number(l.value_estimate ?? 0), 0),
        pendingApprovals: (approvals.data ?? []).length,
        overdueTasks: (overdue.data ?? []).length,
        upcomingTasks: (upcoming.data ?? []).length,
        receivables,
        overdueValue,
        collected30: (payments.data ?? []).reduce((s, p) => s + Number(p.amount), 0),
      },
      stageCounts,
      atRisk: active
        .filter((p) => p.target_date && p.target_date < iso(today) && p.stage !== "completed")
        .slice(0, 6),
      enquiries: enquiries.data ?? [],
      approvals: approvals.data ?? [],
      overdue: overdue.data ?? [],
      upcoming: upcoming.data ?? [],
      activity: activity.data ?? [],
    };
  });

/* ------------------------------- Leads / CRM ------------------------------ */

export const listLeadsBoard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertStaff(supabase, userId);

    const [leads, enquiries, staff] = await Promise.all([
      supabase
        .from("leads")
        .select("id, name, email, phone, city, space_type, budget_band, stage, value_estimate, owner_id, client_id, notes, created_at, updated_at")
        .order("updated_at", { ascending: false }),
      supabase
        .from("enquiries")
        .select("id, name, email, phone, city, space_type, budget_band, message, status, source, created_at")
        .order("created_at", { ascending: false })
        .limit(60),
      supabase.from("profiles").select("id, full_name, title"),
    ]);

    const leadEnquiryIds = new Set<string>();
    const { data: linked } = await supabase.from("leads").select("enquiry_id");
    for (const l of linked ?? []) if (l.enquiry_id) leadEnquiryIds.add(l.enquiry_id);

    return {
      leads: leads.data ?? [],
      unconverted: (enquiries.data ?? []).filter((e) => !leadEnquiryIds.has(e.id)),
      staff: staff.data ?? [],
    };
  });

export const getLead = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { id: string }) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await assertStaff(supabase, userId);

    const [lead, staff] = await Promise.all([
      supabase
        .from("leads")
        .select("*, enquiries(name, message, source, created_at), clients(id, name, email)")
        .eq("id", data.id)
        .maybeSingle(),
      supabase.from("profiles").select("id, full_name, title"),
    ]);
    if (!lead.data) return null;

    const [tasks, activity] = await Promise.all([
      supabase
        .from("tasks")
        .select("id, title, status, due_date, assignee_name, priority, project_id")
        .is("project_id", null)
        .order("due_date", { ascending: true }),
      supabase
        .from("activity_log")
        .select("id, action, detail, actor_label, created_at")
        .eq("entity", "lead")
        .eq("entity_id", data.id)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    return {
      lead: lead.data,
      staff: staff.data ?? [],
      followUps: tasks.data ?? [],
      activity: activity.data ?? [],
    };
  });

export const createLeadFromEnquiry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { enquiryId: string }) => z.object({ enquiryId: z.string().uuid() }).parse(i))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await assertStaff(supabase, userId);

    const { data: enq, error: eErr } = await supabase
      .from("enquiries")
      .select("*")
      .eq("id", data.enquiryId)
      .maybeSingle();
    if (eErr) throw new Error(eErr.message);
    if (!enq) throw new Error("Enquiry not found.");

    const { data: lead, error } = await supabase
      .from("leads")
      .insert({
        enquiry_id: enq.id,
        name: enq.name,
        email: enq.email,
        phone: enq.phone,
        city: enq.city,
        space_type: enq.space_type,
        budget_band: enq.budget_band,
        notes: enq.message,
        stage: "new",
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    await supabase.from("enquiries").update({ status: "converted" }).eq("id", enq.id);
    await logActivity(supabase, userId, "lead", lead.id, "lead_created", `Lead created from enquiry by ${enq.name}`);
    return { id: lead.id };
  });

export const updateLead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        stage: z.enum(["new", "contacted", "qualified", "proposal", "won", "lost"]).optional(),
        owner_id: z.string().uuid().nullable().optional(),
        value_estimate: z.number().min(0).max(1_000_000_000).optional(),
        notes: z.string().max(4000).nullable().optional(),
      })
      .parse(i),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await assertStaff(supabase, userId);
    const { id, ...patch } = data;
    const { error } = await supabase
      .from("leads")
      .update({ ...patch, updated_at: new Date().toISOString() } as never)
      .eq("id", id);
    if (error) throw new Error(error.message);
    await logActivity(
      supabase,
      userId,
      "lead",
      id,
      patch.stage ? "stage_changed" : "lead_updated",
      patch.stage ? `Stage moved to ${patch.stage}` : "Lead details updated",
    );
    return { ok: true };
  });

export const convertLeadToProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        leadId: z.string().uuid(),
        title: z.string().trim().min(3).max(160),
        city: z.string().trim().min(2).max(80),
        space_type: z.string().trim().min(2).max(80),
        style: z.string().trim().min(2).max(80),
        area_sqft: z.number().int().min(50).max(500000),
        budget_amount: z.number().min(0).max(1_000_000_000),
        budget_band: z.string().trim().min(1).max(40),
        target_date: z.string().optional().nullable(),
      })
      .parse(i),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await assertStaff(supabase, userId);

    const { data: lead, error: lErr } = await supabase
      .from("leads")
      .select("*")
      .eq("id", data.leadId)
      .maybeSingle();
    if (lErr) throw new Error(lErr.message);
    if (!lead) throw new Error("Lead not found.");

    let clientId = lead.client_id;
    if (!clientId) {
      const { data: existing } = await supabase
        .from("clients")
        .select("id")
        .ilike("email", lead.email)
        .maybeSingle();
      if (existing) clientId = existing.id;
      else {
        const { data: created, error: cErr } = await supabase
          .from("clients")
          .insert({ name: lead.name, email: lead.email, phone: lead.phone, city: lead.city })
          .select("id")
          .single();
        if (cErr) throw new Error(cErr.message);
        clientId = created.id;
      }
      await supabase.from("leads").update({ client_id: clientId }).eq("id", lead.id);
    }

    const slugBase = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const suffix = Math.random().toString(36).slice(2, 6);
    const { count } = await supabase.from("projects").select("id", { count: "exact", head: true });
    const code = `AV-${String((count ?? 0) + 1).padStart(3, "0")}`;

    const { data: project, error: pErr } = await supabase
      .from("projects")
      .insert({
        client_id: clientId,
        code,
        slug: `${slugBase}-${suffix}`,
        title: data.title,
        city: data.city,
        space_type: data.space_type,
        style: data.style,
        area_sqft: data.area_sqft,
        budget_amount: data.budget_amount,
        budget_band: data.budget_band,
        stage: "brief",
        progress: 5,
        start_date: new Date().toISOString().slice(0, 10),
        target_date: data.target_date || null,
      })
      .select("id")
      .single();
    if (pErr) throw new Error(pErr.message);

    await supabase.from("leads").update({ stage: "won", updated_at: new Date().toISOString() }).eq("id", lead.id);
    await logActivity(supabase, userId, "project", project.id, "project_created", `Project ${code} created from lead ${lead.name}`, project.id);
    return { projectId: project.id };
  });

export const createFollowUpTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        title: z.string().trim().min(3).max(200),
        due_date: z.string().min(4),
        assignee_id: z.string().uuid().nullable().optional(),
        assignee_name: z.string().max(120).nullable().optional(),
        priority: z.enum(["low", "medium", "high"]).default("medium"),
        description: z.string().max(2000).nullable().optional(),
        project_id: z.string().uuid().nullable().optional(),
        room_id: z.string().uuid().nullable().optional(),
      })
      .parse(i),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await assertStaff(supabase, userId);
    const { error } = await supabase.from("tasks").insert({
      // project_id is optional for lead follow-ups
      ...({} as Record<string, never>),
      title: data.title,
      description: data.description ?? null,
      due_date: data.due_date,
      assignee_id: data.assignee_id ?? null,
      assignee_name: data.assignee_name ?? null,
      priority: data.priority,
      status: "todo",
      project_id: data.project_id ?? null,
      room_id: data.room_id ?? null,
    } as never);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ------------------------------- Projects -------------------------------- */

export const listProjects = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertStaff(supabase, userId);

    const [projects, tasks, approvals, invoices] = await Promise.all([
      supabase
        .from("projects")
        .select("id, code, title, city, stage, style, space_type, progress, budget_amount, target_date, lead_designer_name, is_active, cover_image, clients(name)")
        .order("created_at", { ascending: false }),
      supabase.from("tasks").select("project_id, status, due_date"),
      supabase.from("approvals").select("project_id, status"),
      supabase.from("invoices").select("project_id, total, amount_paid, status"),
    ]);

    const byProject = new Map<
      string,
      { openTasks: number; overdueTasks: number; pendingApprovals: number; outstanding: number }
    >();
    const get = (id: string | null) => {
      if (!id) return null;
      if (!byProject.has(id))
        byProject.set(id, { openTasks: 0, overdueTasks: 0, pendingApprovals: 0, outstanding: 0 });
      return byProject.get(id)!;
    };
    const today = new Date().toISOString().slice(0, 10);
    for (const t of tasks.data ?? []) {
      const e = get(t.project_id);
      if (!e || t.status === "done") continue;
      e.openTasks += 1;
      if (t.due_date && t.due_date < today) e.overdueTasks += 1;
    }
    for (const a of approvals.data ?? []) {
      const e = get(a.project_id);
      if (e && a.status === "pending") e.pendingApprovals += 1;
    }
    for (const i of invoices.data ?? []) {
      const e = get(i.project_id);
      if (e && i.status !== "draft") e.outstanding += Number(i.total) - Number(i.amount_paid);
    }

    return (projects.data ?? []).map((p) => ({
      ...p,
      metrics:
        byProject.get(p.id) ?? { openTasks: 0, overdueTasks: 0, pendingApprovals: 0, outstanding: 0 },
    }));
  });

export const getProjectWorkspace = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { id: string }) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await assertStaff(supabase, userId);
    const id = data.id;

    const [project, rooms, tasks, designs, approvals, docs, invoices, boq, updates, staff, activity] =
      await Promise.all([
        supabase
          .from("projects")
          .select("*, clients(id, name, email, phone, city)")
          .eq("id", id)
          .maybeSingle(),
        supabase.from("rooms").select("*").eq("project_id", id).order("sort_order"),
        supabase
          .from("tasks")
          .select("id, title, description, status, priority, due_date, assignee_id, assignee_name, room_id, created_at")
          .eq("project_id", id)
          .order("due_date", { ascending: true }),
        supabase
          .from("design_files")
          .select("*")
          .eq("project_id", id)
          .order("created_at", { ascending: false }),
        supabase
          .from("approvals")
          .select("*, approval_comments(id, body, author_name, created_at)")
          .eq("project_id", id)
          .order("requested_at", { ascending: false }),
        supabase.from("documents").select("*").eq("project_id", id).order("created_at", { ascending: false }),
        supabase.from("invoices").select("*").eq("project_id", id).order("created_at", { ascending: false }),
        supabase.from("boq_items").select("*").eq("project_id", id).order("category"),
        supabase.from("site_updates").select("*").eq("project_id", id).order("created_at", { ascending: false }),
        supabase.from("profiles").select("id, full_name, title"),
        supabase
          .from("activity_log")
          .select("id, action, entity, detail, actor_label, created_at")
          .eq("project_id", id)
          .order("created_at", { ascending: false })
          .limit(25),
      ]);

    if (!project.data) return null;

    return {
      project: project.data,
      rooms: rooms.data ?? [],
      tasks: tasks.data ?? [],
      designs: designs.data ?? [],
      approvals: approvals.data ?? [],
      documents: docs.data ?? [],
      invoices: invoices.data ?? [],
      boq: boq.data ?? [],
      updates: updates.data ?? [],
      staff: staff.data ?? [],
      activity: activity.data ?? [],
    };
  });

export const updateTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["todo", "in_progress", "blocked", "done"]).optional(),
        assignee_id: z.string().uuid().nullable().optional(),
        assignee_name: z.string().max(120).nullable().optional(),
        due_date: z.string().nullable().optional(),
      })
      .parse(i),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await assertStaff(supabase, userId);
    const { id, ...patch } = data;
    const { error } = await supabase.from("tasks").update(patch as never).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateProjectStage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        stage: z
          .enum(["brief", "concept", "design_development", "execution", "handover", "completed"])
          .optional(),
        progress: z.number().int().min(0).max(100).optional(),
      })
      .parse(i),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await assertStaff(supabase, userId);
    const { id, ...patch } = data;
    const { error } = await supabase.from("projects").update(patch as never).eq("id", id);
    if (error) throw new Error(error.message);
    await logActivity(supabase, userId, "project", id, "project_updated", patch.stage ? `Stage set to ${patch.stage}` : `Progress set to ${patch.progress}%`, id);
    return { ok: true };
  });

export const setDesignVisibility = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({ id: z.string().uuid(), visible_to_client: z.boolean() }).parse(i),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await assertStaff(supabase, userId);
    const { error } = await supabase
      .from("design_files")
      .update({ visible_to_client: data.visible_to_client })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const requestApproval = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        project_id: z.string().uuid(),
        design_file_id: z.string().uuid().nullable().optional(),
        room_id: z.string().uuid().nullable().optional(),
        title: z.string().trim().min(3).max(200),
        notes: z.string().max(2000).nullable().optional(),
      })
      .parse(i),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await assertStaff(supabase, userId);
    const { error } = await supabase.from("approvals").insert({
      project_id: data.project_id,
      design_file_id: data.design_file_id ?? null,
      room_id: data.room_id ?? null,
      title: data.title,
      notes: data.notes ?? null,
      status: "pending",
    });
    if (error) throw new Error(error.message);
    await logActivity(supabase, userId, "approval", null, "approval_requested", data.title, data.project_id);
    return { ok: true };
  });

export const listPendingApprovals = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertStaff(supabase, userId);
    const { data, error } = await supabase
      .from("approvals")
      .select("*, projects(id, title, code, clients(name)), approval_comments(id, body, author_name, created_at)")
      .order("requested_at", { ascending: false })
      .limit(120);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

/* ------------------------------ Activity log ----------------------------- */

type LogClient = {
  from: (t: "profiles" | "activity_log") => {
    select: (s: string) => {
      eq: (c: string, v: string) => { maybeSingle: () => Promise<{ data: { full_name: string } | null }> };
    };
    insert: (v: Record<string, unknown>) => Promise<{ error: unknown }>;
  };
};

async function logActivity(
  supabase: unknown,
  actorId: string,
  entity: string,
  entityId: string | null,
  action: string,
  detail: string,
  projectId?: string,
) {
  const db = supabase as LogClient;
  const { data: profile } = await db.from("profiles").select("full_name").eq("id", actorId).maybeSingle();
  await db.from("activity_log").insert({
    actor_id: actorId,
    actor_label: profile?.full_name || "Studio member",
    entity,
    entity_id: entityId,
    action,
    detail,
    project_id: projectId ?? null,
  });
}
