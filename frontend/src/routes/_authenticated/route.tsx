import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getMySession, type SessionInfo } from "@/lib/session.functions";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    let session: SessionInfo | null = null;
    try {
      session = await getMySession();
    } catch {
      session = null;
    }

    if (session && session.email) {
      const userId = session.userId || (session as any).id || "usr_owner_principal";
      return {
        session,
        user: {
          id: userId,
          email: session.email,
          user_metadata: { full_name: session.fullName },
        },
      };
    }

    // Unauthenticated access strictly redirects to login page
    throw redirect({
      to: "/auth",
      search: {
        redirect: location.href,
      },
    });
  },
  component: () => <Outlet />,
});

