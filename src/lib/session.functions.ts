import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type AppRole = "admin" | "designer" | "project_manager" | "accounts" | "client";

export type SessionInfo = {
  userId: string;
  fullName: string;
  email: string;
  title: string | null;
  roles: AppRole[];
  isStaff: boolean;
  clientIds: string[];
};

export const getMySession = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<SessionInfo> => {
    const { supabase, userId } = context;

    const [profileRes, rolesRes, clientRes] = await Promise.all([
      supabase.from("profiles").select("full_name, email, title").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase.from("clients").select("id").eq("user_id", userId),
    ]);

    const roles = (rolesRes.data ?? []).map((r) => r.role as AppRole);
    const isStaff = roles.some((r) => r !== "client");

    return {
      userId,
      fullName: profileRes.data?.full_name ?? "",
      email: profileRes.data?.email ?? "",
      title: profileRes.data?.title ?? null,
      roles,
      isStaff,
      clientIds: (clientRes.data ?? []).map((c) => c.id),
    };
  });
