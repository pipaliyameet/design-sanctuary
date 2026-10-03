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

    if (session) {
      if (location.pathname.startsWith("/portal")) {
        throw redirect({ to: "/studio" });
      }
      return {
        session,
        user: {
          id: session.userId,
          email: session.email,
          user_metadata: { full_name: session.fullName },
        },
      };
    }

    // Unauthenticated access redirects to owner login
    throw redirect({
      to: "/auth",
    });
  },
  component: () => <Outlet />,
});

