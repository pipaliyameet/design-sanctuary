import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Users,
  Search,
  Mail,
  Phone,
  MapPin,
  FolderKanban,
  Receipt,
  CheckCircle2,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { getStudioClients } from "@/lib/studio-admin.functions";
import {
  AppShell,
  EmptyState,
  ErrorBlock,
  LoadingBlock,
  PageTitle,
  StatCard,
  inr,
  shortDate,
} from "@/components/app/AppShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/studio/clients/")({
  component: ClientsPage,
  head: () => ({
    meta: [
      { title: "Client Directory & Portfolios — Right-Angle-Design-Studio" },
      {
        name: "description",
        content:
          "Complete portfolio visibility into client accounts, contracts, payments, and approvals.",
      },
    ],
  }),
});

function ClientsPage() {
  const fetchClients = useServerFn(getStudioClients);
  const {
    data: clients,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["studio", "clients"],
    queryFn: () => fetchClients(),
  });

  const [search, setSearch] = useState("");

  const filteredClients = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (clients ?? []).filter((c) => {
      if (!q) return true;
      return [c.name, c.email, c.phone, c.city, c.notes]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [clients, search]);

  const totalContractValue = (clients ?? []).reduce((s, c) => s + c.total_contract_value, 0);
  const totalPaid = (clients ?? []).reduce((s, c) => s + c.total_paid, 0);
  const totalOutstanding = (clients ?? []).reduce((s, c) => s + c.total_outstanding, 0);

  return (
    <AppShell>
      <PageTitle eyebrow="Studio CRM" title={`Client Directory (${filteredClients.length})`} />

      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <StatCard label="Total Client Billings" value={inr(totalContractValue)} tone="default" />
        <StatCard label="Total Received" value={inr(totalPaid)} tone="success" />
        <StatCard label="Total Receivables" value={inr(totalOutstanding)} tone="warn" />
      </div>

      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by client name, email, phone, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>
      </div>

      {isLoading && <LoadingBlock label="Retrieving client registers…" />}
      {error && <ErrorBlock error={error} onRetry={() => refetch()} />}

      {clients && (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className="rounded border border-border bg-card p-5 space-y-4 hover:border-accent/60 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
                <div>
                  <h3 className="font-display text-lg font-medium text-foreground">
                    {client.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-accent" /> {client.address}
                  </p>
                </div>
                <Badge
                  variant={client.status === "active" ? "default" : "outline"}
                  className="text-[10px] uppercase"
                >
                  {client.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Contact Details
                  </span>
                  <div className="mt-1 space-y-0.5">
                    <p className="text-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3 text-muted-foreground" /> {client.phone}
                    </p>
                    <p className="text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3 text-muted-foreground" /> {client.email}
                    </p>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Commissions & History
                  </span>
                  <div className="mt-1 space-y-0.5 text-foreground">
                    <p>{client.total_projects} Active Project</p>
                    <p className="text-muted-foreground">Client Since {client.since}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 border-t border-border pt-3 text-xs font-mono">
                <div>
                  <span className="text-[9px] uppercase text-muted-foreground font-sans">
                    Contract
                  </span>
                  <p className="font-medium text-foreground">{inr(client.total_contract_value)}</p>
                </div>
                <div>
                  <span className="text-[9px] uppercase text-muted-foreground font-sans">Paid</span>
                  <p className="font-medium text-emerald-600">{inr(client.total_paid)}</p>
                </div>
                <div>
                  <span className="text-[9px] uppercase text-muted-foreground font-sans">
                    Pending
                  </span>
                  <p className="font-medium text-accent">{inr(client.total_outstanding)}</p>
                </div>
              </div>

              {client.notes && (
                <p className="text-xs text-muted-foreground bg-muted/30 p-2.5 rounded leading-relaxed">
                  {client.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
