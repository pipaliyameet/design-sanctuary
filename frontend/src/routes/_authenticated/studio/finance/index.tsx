import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  CircleDollarSign,
  TrendingUp,
  Receipt,
  CreditCard,
  Building,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
} from "lucide-react";
import { getStudioFinanceOverview } from "@/lib/studio-admin.functions";
import {
  AppShell,
  EmptyState,
  ErrorBlock,
  LoadingBlock,
  PageTitle,
  Panel,
  StatCard,
  inr,
  shortDate,
} from "@/components/app/AppShell";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/studio/finance/")({
  component: StudioFinancePage,
  head: () => ({
    meta: [
      { title: "Executive Finance & Profitability — Right-Angle-Design-Studio" },
      {
        name: "description",
        content:
          "Studio financial ledger, pending receivables, expenses, and project gross profit margins.",
      },
    ],
  }),
});

function StudioFinancePage() {
  const fetchFinance = useServerFn(getStudioFinanceOverview);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["studio", "finance"],
    queryFn: () => fetchFinance(),
  });

  return (
    <AppShell>
      <PageTitle eyebrow="Studio Financial Command" title="Executive Finance & Margins" />

      {isLoading && <LoadingBlock label="Calculating studio financial ledger…" />}
      {error && <ErrorBlock error={error} onRetry={() => refetch()} />}

      {data && (
        <div className="space-y-8">
          {/* Executive KPIs */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard label="Total Invoiced" value={inr(data.kpis.totalInvoiced)} tone="default" />
            <StatCard label="Cash Collected" value={inr(data.kpis.totalCollected)} tone="success" />
            <StatCard
              label="Pending Receivables"
              value={inr(data.kpis.totalOutstanding)}
              tone="warn"
            />
            <StatCard
              label="Recorded Expenses"
              value={inr(data.kpis.totalExpenses)}
              tone="default"
            />
            <StatCard label="Net Operating Profit" value={inr(data.kpis.netProfit)} tone="accent" />
          </div>

          {/* PROJECT-LEVEL PROFITABILITY MATRIX */}
          <section className="rounded border border-border bg-card overflow-hidden">
            <div className="border-b border-border px-5 py-3.5 bg-muted/20">
              <h2 className="text-xs font-semibold tracking-[0.16em] uppercase text-muted-foreground">
                Project Gross Margins & Financial Exposure
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/10 text-[11px] font-semibold uppercase text-muted-foreground">
                    <th className="px-5 py-3">Code & Project</th>
                    <th className="px-4 py-3 text-right">Contract Value</th>
                    <th className="px-4 py-3 text-right">Collected</th>
                    <th className="px-4 py-3 text-right">Spent on Materials & Labour</th>
                    <th className="px-4 py-3 text-right">Project Expenses</th>
                    <th className="px-5 py-3 text-right">Gross Margin %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-mono">
                  {data.projectProfits.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/30">
                      <td className="px-5 py-3.5 font-sans font-medium text-foreground">
                        <span className="font-mono text-muted-foreground mr-2">{p.code}</span>
                        {p.title}
                      </td>
                      <td className="px-4 py-3.5 text-right text-foreground font-medium">
                        {inr(p.contractValue)}
                      </td>
                      <td className="px-4 py-3.5 text-right text-emerald-600 font-medium">
                        {inr(p.received)}
                      </td>
                      <td className="px-4 py-3.5 text-right text-muted-foreground">
                        {inr(p.spent)}
                      </td>
                      <td className="px-4 py-3.5 text-right text-muted-foreground">
                        {inr(p.expenses)}
                      </td>
                      <td className="px-5 py-3.5 text-right font-sans">
                        <Badge
                          variant={p.estimatedMarginPercent > 30 ? "default" : "secondary"}
                          className="text-[11px] font-mono font-semibold"
                        >
                          {p.estimatedMarginPercent}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* TWO COLUMN INVOICES & EXPENSES */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Invoices List */}
            <Panel title="Recent Invoices">
              <div className="divide-y divide-border">
                {data.invoices.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between py-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium text-foreground">{inv.number}</span>
                        <Badge
                          variant={inv.status === "paid" ? "default" : "outline"}
                          className="text-[9px] uppercase"
                        >
                          {inv.status.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mt-0.5">
                        {inv.project_title} · Due {shortDate(inv.due_date)}
                      </p>
                    </div>
                    <div className="text-right font-mono">
                      <p className="font-medium text-foreground">{inr(inv.amount)}</p>
                      <p className="text-[10px] text-muted-foreground">
                        Paid: {inr(inv.amount_paid)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            {/* Expenses List */}
            <Panel title="Studio & Project Outflows">
              <div className="divide-y divide-border">
                {data.expenses.map((exp) => (
                  <div key={exp.id} className="flex items-center justify-between py-3 text-xs">
                    <div>
                      <span className="text-[10px] font-semibold uppercase text-accent">
                        {exp.category}
                      </span>
                      <p className="font-medium text-foreground mt-0.5">{exp.description}</p>
                      <p className="text-muted-foreground text-[11px]">
                        {exp.vendor_name} · {shortDate(exp.date)}
                      </p>
                    </div>
                    <div className="text-right font-mono">
                      <p className="font-medium text-foreground">{inr(exp.amount)}</p>
                      <p className="text-[10px] text-muted-foreground">{exp.paid_by}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      )}
    </AppShell>
  );
}
