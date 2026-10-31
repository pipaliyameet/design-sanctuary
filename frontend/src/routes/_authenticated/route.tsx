import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getMySession, type SessionInfo } from "@/lib/session.functions";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    // 1. SSR Guard: The server in Node/Nitro has no access to client localStorage.
    // Allow the route to hydrate on the client without premature server-side redirection.
    if (typeof window === "undefined") {
      return;
    }

    // 2. Client verification
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

