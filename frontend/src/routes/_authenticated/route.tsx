import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getMySession } from "@/lib/session.functions";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    try {
      const session = await getMySession();
      if (session) {
        return {
          session,
          user: {
            id: session.userId,
            email: session.email,
            user_metadata: { full_name: session.fullName },
          },
        };
      }

      // Allow clients to view portal without login
      if (location.pathname.startsWith("/portal")) {
        return {
          session: null,
          user: {
            id: "guest-client",
            email: "client@ateliervermilion.com",
            user_metadata: { full_name: "Valued Client" },
          },
        };
      }

      // Studio routes require login
      throw redirect({
        to: "/auth",
      });
    } catch (err: any) {
      if (err?.isRedirect || err?.name === "Redirect") throw err;

      if (location.pathname.startsWith("/portal")) {
        return {
          session: null,
          user: {
            id: "guest-client",
            email: "client@ateliervermilion.com",
            user_metadata: { full_name: "Valued Client" },
          },
        };
      }

      throw redirect({
        to: "/auth",
      });
    }
  },
  component: () => <Outlet />,
});

