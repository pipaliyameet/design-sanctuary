import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

export function PublicShell({
  children,
  overlayHeader = false,
}: {
  children: ReactNode;
  overlayHeader?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader overlay={overlayHeader} />
      <main className={overlayHeader ? "flex-1" : "flex-1 pt-16"}>{children}</main>
      <SiteFooter />
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
}) {
  return (
    <section className="border-b border-border bg-secondary/40">
      <div className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8 sm:py-28">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-5 max-w-3xl text-4xl leading-[1.05] sm:text-6xl">{title}</h1>
        {intro && (
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground">{intro}</p>
        )}
      </div>
    </section>
  );
}
