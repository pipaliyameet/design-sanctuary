import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/portal/$id")({
  beforeLoad: () => {
    throw redirect({ to: "/studio" });
  },
  component: () => null,
});
