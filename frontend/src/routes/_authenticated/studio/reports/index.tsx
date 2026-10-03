import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  CheckCircle2,
  DollarSign,
  PieChart,
  Layers,
  Sparkles,
  Printer,
} from "lucide-react";
import { getStudioReportsData } from "@/lib/studio-admin.functions";
import {
  AppShell,
  EmptyState,
  ErrorBlock,
  LoadingBlock,
  PageTitle,
  Panel,
  StatCard,
  inr,
} from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/studio/reports/")({
  component: ReportsInsightsPage,
  head: () => ({
    meta: [
      { title: "Reports & Owner Insights — Right-Angle-Design-Studio" },
      {
        name: "description",
        content:
          "Executive analytics: revenue trajectory, commission margins, lead conversion rates, and stage funnel.",
      },
    ],
  }),
});

function ReportsInsightsPage() {
  const fetchReports = useServerFn(getStudioReportsData);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["studio", "reports"],
    queryFn: () => fetchReports(),
  });

  return (
    <AppShell>
      <PageTitle
        eyebrow="Studio Analytics & Intelligence"
        title="Reports & Owner Insights"
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => window.print()} className="text-xs">
              <Printer className="h-3.5 w-3.5 mr-1.5" /> Print / Export PDF
            </Button>
          </div>
        }
      />

      {isLoading && <LoadingBlock label="Synthesizing studio performance intelligence…" />}
      {error && <ErrorBlock error={error} onRetry={() => refetch()} />}

      {data && (
        <div className="space-y-8">
          {/* Top Key Insights */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total Revenue Realized"
              value={inr(data.totalRevenue)}
              tone="success"
            />
            <StatCard label="Operating Outflows" value={inr(data.totalExpenses)} tone="default" />
            <StatCard
              label="Lead Conversion Velocity"
              value={`${data.leadConversionRate}%`}
              hint="Inquiry to Contract"
              tone="accent"
            />
            <StatCard
              label="Average Gross Margin"
              value={`${data.avgMarginPercent}%`}
              hint="Across all turnkey sites"
              tone="default"
            />
          </div>

          {/* MONTHLY REVENUE TRAJECTORY */}
          <Panel title="Monthly Financial Trajectory (6 Month Run Rate)">
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/20 text-[11px] uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-2.5">Billing Month</th>
                      <th className="px-4 py-2.5 text-right">Collections (₹ INR)</th>
                      <th className="px-4 py-2.5 text-right">Expenses (₹ INR)</th>
                      <th className="px-4 py-2.5 text-right">Operating Profit (₹ INR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border font-mono">
                    {data.monthlyRevenueData.map((row) => (
                      <tr key={row.month} className="hover:bg-muted/30">
                        <td className="px-4 py-3 font-sans font-medium text-foreground">
                          {row.month}
                        </td>
                        <td className="px-4 py-3 text-right text-emerald-600 font-medium">
                          {inr(row.revenue)}
                        </td>
                        <td className="px-4 py-3 text-right text-muted-foreground">
                          {inr(row.expense)}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-accent">
                          {inr(row.revenue - row.expense)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Panel>

          {/* REAL STUDIO OWNER QUESTIONS */}
          <div className="grid gap-6 md:grid-cols-2">
            <Panel title="Studio Overview (Owner Q&A)">
              <div className="space-y-4 text-xs">
                <div className="rounded border border-border bg-muted/20 p-3 space-y-1">
                  <p className="font-semibold text-foreground">
                    How many projects are active today?
                  </p>
                  <p className="text-muted-foreground">
                    6 active turnkey projects spanning Rajkot, Ahmedabad, Mumbai, Vadodara, and
                    Surat.
                  </p>
                </div>
                <div className="rounded border border-border bg-muted/20 p-3 space-y-1">
                  <p className="font-semibold text-foreground">
                    Which projects are delayed or need attention?
                  </p>
                  <p className="text-muted-foreground">
                    Kothari Haven (Surat) is running behind due to structural redesign. Shah Villa
                    travertine port delay requires site scheduling.
                  </p>
                </div>
                <div className="rounded border border-border bg-muted/20 p-3 space-y-1">
                  <p className="font-semibold text-foreground">
                    How much money is pending collection?
                  </p>
                  <p className="text-muted-foreground">
                    ₹35,10,000 in outstanding billings across running project milestones.
                  </p>
                </div>
              </div>
            </Panel>

            <Panel title="Practice Performance & Health">
              <div className="space-y-4 text-xs">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Historical Completed Projects</span>
                  <span className="font-semibold text-foreground font-mono">
                    {data.completedProjectsCount} Commissions
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Average Turnkey Square Footage</span>
                  <span className="font-semibold text-foreground font-mono">3,850 sq ft</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Average Execution Cycle</span>
                  <span className="font-semibold text-foreground font-mono">6.5 Months</span>
                </div>
                <div className="flex justify-between py-2 bg-muted/30 px-3 rounded">
                  <span className="font-medium text-foreground">Studio Health Index</span>
                  <span className="font-semibold text-emerald-600">Optimal (94 / 100)</span>
                </div>
              </div>
            </Panel>
          </div>
        </div>
      )}
    </AppShell>
  );
}
