import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Client portal reads. RLS (owns_project / clients.user_id) is the boundary —
 *  these functions never widen it, and client-hidden rows are filtered too. */

export const getMyPortal = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data: clients } = await supabase
      .from("clients")
      .select("id, name, email, city")
      .eq("user_id", userId);

    const { data: projects, error } = await supabase
      .from("projects")
      .select("id, code, title, city, stage, progress, cover_image, start_date, target_date, lead_designer_name")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    const ids = (projects ?? []).map((p) => p.id);
    if (ids.length === 0) return { client: clients?.[0] ?? null, projects: [] };

    const [approvals, invoices, updates] = await Promise.all([
      supabase.from("approvals").select("project_id, status").in("project_id", ids),
      supabase.from("invoices").select("project_id, total, amount_paid, status").in("project_id", ids),
      supabase
        .from("site_updates")
        .select("project_id, title, created_at")
        .eq("visible_to_client", true)
        .in("project_id", ids)
        .order("created_at", { ascending: false }),
    ]);

    return {
      client: clients?.[0] ?? null,
      projects: (projects ?? []).map((p) => ({
        ...p,
        pendingApprovals: (approvals.data ?? []).filter(
          (a) => a.project_id === p.id && a.status === "pending",
        ).length,
        outstanding: (invoices.data ?? [])
          .filter((i) => i.project_id === p.id && i.status !== "draft")
          .reduce((s, i) => s + (Number(i.total) - Number(i.amount_paid)), 0),
        lastUpdate: (updates.data ?? []).find((u) => u.project_id === p.id) ?? null,
      })),
    };
  });

export const getPortalProject = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((i: { id: string }) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    const id = data.id;

    const { data: project, error } = await supabase
      .from("projects")
      .select("id, code, title, city, stage, style, space_type, progress, area_sqft, brief, cover_image, start_date, target_date, lead_designer_name")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!project) return null;

    const [rooms, designs, approvals, docs, invoices, boq, updates, payments] = await Promise.all([
      supabase.from("rooms").select("id, name, room_type, area_sqft, status, sort_order").eq("project_id", id).order("sort_order"),
      supabase
        .from("design_files")
        .select("id, title, kind, file_url, version, room_id, created_at")
        .eq("project_id", id)
        .eq("visible_to_client", true)
        .order("created_at", { ascending: false }),
      supabase
        .from("approvals")
        .select("id, title, status, notes, requested_at, decided_at, decided_by_name, design_file_id, room_id, approval_comments(id, body, author_name, created_at)")
        .eq("project_id", id)
        .order("requested_at", { ascending: false }),
      supabase
        .from("documents")
        .select("id, title, kind, file_url, created_at")
        .eq("project_id", id)
        .eq("visible_to_client", true)
        .order("created_at", { ascending: false }),
      supabase
        .from("invoices")
        .select("id, number, milestone, amount, tax_percent, total, amount_paid, status, issued_at, due_at")
        .eq("project_id", id)
        .neq("status", "draft")
        .order("created_at", { ascending: false }),
      supabase
        .from("boq_items")
        .select("id, category, description, unit, quantity, rate, amount, room_id")
        .eq("project_id", id)
        .order("category"),
      supabase
        .from("site_updates")
        .select("id, title, body, image_url, progress, created_at, created_by_name")
        .eq("project_id", id)
        .eq("visible_to_client", true)
        .order("created_at", { ascending: false }),
      supabase.from("payments").select("id, amount, method, paid_at, reference").eq("project_id", id).order("paid_at", { ascending: false }),
    ]);

    return {
      project,
      rooms: rooms.data ?? [],
      designs: designs.data ?? [],
      approvals: approvals.data ?? [],
      documents: docs.data ?? [],
      invoices: invoices.data ?? [],
      boq: boq.data ?? [],
      updates: updates.data ?? [],
      payments: payments.data ?? [],
    };
  });

export const respondToApproval = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((i: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        decision: z.enum(["approved", "changes_requested"]),
        comment: z.string().trim().max(2000).optional(),
      })
      .parse(i),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .maybeSingle();
    const name = profile?.full_name || "Client";

    const { data: approval, error } = await supabase
      .from("approvals")
      .update({
        status: data.decision,
        decided_at: new Date().toISOString(),
        decided_by_name: name,
      })
      .eq("id", data.id)
      .select("id, project_id, title")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!approval) throw new Error("Approval not found or not yours.");

    if (data.comment) {
      const { error: cErr } = await supabase.from("approval_comments").insert({
        approval_id: approval.id,
        author_id: userId,
        author_name: name,
        body: data.comment,
      });
      if (cErr) throw new Error(cErr.message);
    }

    return { ok: true };
  });

export const addApprovalComment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((i: unknown) =>
    z.object({ approvalId: z.string().uuid(), body: z.string().trim().min(1).max(2000) }).parse(i),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .maybeSingle();
    const { error } = await supabase.from("approval_comments").insert({
      approval_id: data.approvalId,
      author_id: userId,
      author_name: profile?.full_name || "Client",
      body: data.body,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
