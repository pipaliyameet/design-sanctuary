import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import "../styles.css";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Toaster } from "@/components/ui/sonner";
import { useCmsLiveSync } from "@/lib/cms-live-sync";

import type { ErrorComponentProps } from "@tanstack/react-router";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center flex flex-col items-center">
        <BrandLogo variant="symbol" size="lg" className="mb-6" />
        <h1 className="text-7xl font-light font-display text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-medium text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground font-light">
          The space you're looking for doesn't exist or has been relocated.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center bg-foreground px-6 py-3 text-xs uppercase tracking-[0.2em] font-medium text-background transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Return to Studio Home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error("Root ErrorComponent caught error:", error);
  const router = useRouter();

  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
    if ((error as any)?.isRedirect || (error as any)?.name === "Redirect" || (error as any)?.to) {
      const dest = (error as any)?.to || (error as any)?.href || "/auth";
      try {
        router.navigate({ to: dest });
      } catch {
        if (typeof window !== "undefined") {
          window.location.href = dest;
        }
      }
    }
  }, [error, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <BrandLogo variant="symbol" size="lg" className="mb-6 mx-auto" />
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "Something went wrong on our end. You can try refreshing or head back home."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 cursor-pointer"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent cursor-pointer"
          >
            Go home
          </a>
          <a
            href="/auth"
            className="inline-flex items-center justify-center rounded-md border border-accent bg-accent/10 px-4 py-2 text-sm font-medium text-accent hover:bg-accent hover:text-accent-foreground cursor-pointer"
          >
            Sign in
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "referrer", content: "no-referrer" },
      { title: "Right Angle Design Studio — Interior Architecture & Design" },
      {
        name: "description",
        content:
          "Right Angle Design Studio crafts bespoke residential, commercial and turnkey interiors across India detailed around daylight, stone and quiet craft.",
      },
      { name: "author", content: "Right Angle Design Studio" },
      { property: "og:title", content: "Right Angle Design Studio — Interior Architecture" },
      {
        property: "og:description",
        content: "Spaces shaped by light, material and everyday life.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href:
          typeof appCss === "string" && appCss.startsWith("/src/") && !appCss.includes("?")
            ? `${appCss}?direct`
            : appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400;1,600&family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,300..400&family=Archivo:wght@300;400;500;600&display=swap",
      },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
    ],
  }),

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="light" style={{ colorScheme: "light" }}>
      <head>
        <HeadContent />
      </head>
      <body className="bg-background text-foreground antialiased selection:bg-accent/30 selection:text-foreground">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  useCmsLiveSync(queryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <Toaster position="bottom-right" />
    </QueryClientProvider>
  );
}
