import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  Receipt,
  Search,
  Plus,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Eye,
  X,
  Sparkles,
  Download,
} from "lucide-react";
import { getStudioQuotations } from "@/lib/studio-admin.functions";
import {
  AppShell,
  EmptyState,
  ErrorBlock,
  LoadingBlock,
  PageTitle,
  inr,
  shortDate,
} from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { type StudioQuotation } from "@/lib/studio-mock-data";

export const Route = createFileRoute("/_authenticated/studio/quotations/")({
  component: QuotationsPage,
  head: () => ({
    meta: [
      { title: "Quotations & BOQ Estimations — Right-Angle-Design-Studio" },
      {
        name: "description",
        content:
          "Professional client quotations, room-wise BOQ costing, revisions, and PDF previews.",
      },
    ],
  }),
});

function QuotationsPage() {
  const fetchQuotations = useServerFn(getStudioQuotations);
  const {
    data: quotations,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["studio", "quotations"],
    queryFn: () => fetchQuotations(),
  });

  const [search, setSearch] = useState("");
  const [previewQuotation, setPreviewQuotation] = useState<StudioQuotation | null>(null);

  const filtered = (quotations ?? []).filter((q) => {
    if (!search) return true;
    const query = search.toLowerCase();
    return [q.number, q.project_title, q.client_name, q.version]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(query));
  });

  return (
    <AppShell>
      <PageTitle
        eyebrow="Financial Estimates & BOQ"
        title={`Quotations & Costings (${filtered.length})`}
      />

      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search quotation #, project, client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>
      </div>

      {isLoading && <LoadingBlock label="Compiling quotations & estimates…" />}
      {error && <ErrorBlock error={error} onRetry={() => refetch()} />}

      {quotations && (
        <div className="space-y-4">
          {filtered.map((quot) => (
            <div
              key={quot.id}
              className="rounded border border-border bg-card p-5 space-y-4 hover:border-accent/60 transition-colors"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-accent">
                      {quot.number}
                    </span>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {quot.version}
                    </Badge>
                    <Badge
                      variant={quot.status === "approved" ? "default" : "secondary"}
                      className="text-[10px] uppercase font-semibold"
                    >
                      {quot.status}
                    </Badge>
                  </div>
                  <h3 className="font-display text-lg font-medium text-foreground mt-1">
                    {quot.project_title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Client: {quot.client_name} ({quot.client_email}) · Created{" "}
                    {shortDate(quot.created_at)}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Total Estimate
                  </span>
                  <p className="font-mono text-xl font-semibold text-foreground">
                    {inr(quot.grand_total)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Incl. 18% GST ({inr(quot.gst_total)})
                  </p>
                </div>
              </div>

              {/* Items summary */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border/60 text-[10px] uppercase text-muted-foreground">
                      <th className="py-2">Category & Description</th>
                      <th className="py-2">Room</th>
                      <th className="py-2 text-right">Qty & Unit</th>
                      <th className="py-2 text-right">Rate</th>
                      <th className="py-2 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 font-mono">
                    {quot.items.map((item: any) => (
                      <tr key={item.id}>
                        <td className="py-2 font-sans">
                          <span className="font-medium text-foreground">{item.category}</span>
                          <p className="text-[11px] text-muted-foreground">{item.description}</p>
                        </td>
                        <td className="py-2 text-muted-foreground font-sans">{item.room}</td>
                        <td className="py-2 text-right text-muted-foreground">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="py-2 text-right text-muted-foreground">{inr(item.rate)}</td>
                        <td className="py-2 text-right font-medium text-foreground">
                          {inr(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer and Preview trigger */}
              <div className="flex items-center justify-between border-t border-border pt-3 text-xs">
                <p className="text-muted-foreground text-[11px] max-w-lg truncate">
                  Terms: {quot.payment_terms}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs"
                    onClick={() => setPreviewQuotation(quot)}
                  >
                    <Eye className="h-3.5 w-3.5 mr-1.5" /> Preview Letterhead
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PRINTABLE LETTERHEAD ESTIMATE MODAL */}
      {previewQuotation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded bg-card border border-border p-8 shadow-2xl space-y-6 text-xs">
            <button
              onClick={() => setPreviewQuotation(null)}
              className="absolute top-4 right-4 rounded p-1 text-muted-foreground hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Letterhead Header */}
            <div className="flex justify-between items-start border-b border-border pb-6">
              <div>
                <h2 className="font-display text-2xl font-normal text-foreground">
                  Right-Angle-Design-Studio
                </h2>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-0.5">
                  Interior Architecture & Turnkey Sanctuary
                </p>
                <p className="text-muted-foreground mt-2 leading-relaxed">
                  Right-Angle-Design-Studio HQ, Racecourse Ring Road
                  <br />
                  Rajkot 360001, Gujarat, India
                  <br />
                  GSTIN: 24AAACA1234F1Z5
                </p>
              </div>

              <div className="text-right">
                <span className="font-mono text-sm font-semibold text-accent">
                  {previewQuotation.number}
                </span>
                <p className="text-muted-foreground mt-1">
                  Date: {shortDate(previewQuotation.created_at)}
                </p>
                <p className="text-muted-foreground">
                  Valid Until: {shortDate(previewQuotation.valid_until)}
                </p>
              </div>
            </div>

            {/* Client Info */}
            <div className="grid grid-cols-2 gap-4 bg-muted/20 p-4 rounded border border-border">
              <div>
                <span className="text-[10px] uppercase text-muted-foreground font-semibold">
                  Client / Recipient
                </span>
                <p className="font-medium text-foreground text-sm mt-0.5">
                  {previewQuotation.client_name}
                </p>
                <p className="text-muted-foreground">{previewQuotation.client_email}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase text-muted-foreground font-semibold">
                  Commission Title
                </span>
                <p className="font-medium text-foreground text-sm mt-0.5">
                  {previewQuotation.project_title}
                </p>
                <p className="text-muted-foreground">Version: {previewQuotation.version}</p>
              </div>
            </div>

            {/* Itemized BOQ Table */}
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-[10px] uppercase text-muted-foreground">
                  <th className="py-2.5 px-3">Item Specification</th>
                  <th className="py-2.5 px-3">Room</th>
                  <th className="py-2.5 px-3 text-right">Qty</th>
                  <th className="py-2.5 px-3 text-right">Rate</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-mono">
                {previewQuotation.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2.5 px-3 font-sans">
                      <p className="font-medium text-foreground">{item.category}</p>
                      <p className="text-[11px] text-muted-foreground">{item.description}</p>
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground font-sans">{item.room}</td>
                    <td className="py-2.5 px-3 text-right text-muted-foreground">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="py-2.5 px-3 text-right text-muted-foreground">
                      {inr(item.rate)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-foreground">
                      {inr(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Cost Summary */}
            <div className="flex justify-end border-t border-border pt-4">
              <div className="w-64 space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-mono">{inr(previewQuotation.subtotal)}</span>
                </div>
                {previewQuotation.discount_total > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Studio Courtesy Discount</span>
                    <span className="font-mono">- {inr(previewQuotation.discount_total)}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>GST (18%)</span>
                  <span className="font-mono">{inr(previewQuotation.gst_total)}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 text-base font-semibold text-foreground">
                  <span>Grand Total</span>
                  <span className="font-mono text-accent">{inr(previewQuotation.grand_total)}</span>
                </div>
              </div>
            </div>

            {/* Notes & Sign-off */}
            <div className="border-t border-border pt-4 space-y-2 text-muted-foreground text-[11px]">
              <p>
                <strong>Payment Terms:</strong> {previewQuotation.payment_terms}
              </p>
              <p>
                <strong>Specifications:</strong> {previewQuotation.notes}
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.print()}
                className="gap-1.5 text-xs"
              >
                <Printer className="h-3.5 w-3.5" /> Print / PDF Export
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  toast.success("Quotation sent to client via email/portal.");
                  setPreviewQuotation(null);
                }}
              >
                Send to Client
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
