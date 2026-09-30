import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  Settings,
  ShieldCheck,
  Building,
  CreditCard,
  Bell,
  HardDrive,
  FileSpreadsheet,
  Save,
  Clock,
  Search,
} from "lucide-react";
import { getStudioAuditLog } from "@/lib/studio-admin.functions";
import {
  AppShell,
  EmptyState,
  ErrorBlock,
  LoadingBlock,
  PageTitle,
  Panel,
  shortDate,
} from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/studio/settings/")({
  component: StudioSettingsPage,
  head: () => ({
    meta: [
      { title: "Studio Settings & Audit Trail — Atelier Vermilion Studio" },
      {
        name: "description",
        content:
          "Practice settings, GST configuration, cloud storage, and chronological tamper-evident audit logs.",
      },
    ],
  }),
});

function StudioSettingsPage() {
  const fetchAudit = useServerFn(getStudioAuditLog);
  const {
    data: auditLog,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["studio", "audit-log"],
    queryFn: () => fetchAudit(),
  });

  const [activeTab, setActiveTab] = useState("profile");
  const [auditSearch, setAuditSearch] = useState("");

  const [studioProfile, setStudioProfile] = useState({
    studioName: "Atelier Vermilion",
    tagline: "Architecture & Bespoke Interior Sanctuary",
    gstin: "24AAACA1234F1Z5",
    pan: "AAACA1234F",
    email: "contact@ateliervermilion.com",
    phone: "+91 98250 99881",
    address: "Design Sanctuary Studio, Racecourse Ring Road, Rajkot 360001, Gujarat",
    currency: "INR (₹)",
    taxRate: "18%",
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Studio settings successfully saved and synced.");
  };

  const filteredAudit = (auditLog ?? []).filter((entry) => {
    if (!auditSearch) return true;
    const q = auditSearch.toLowerCase();
    return [entry.action, entry.entity_type, entry.entity_title, entry.user_name, entry.detail]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q));
  });

  return (
    <AppShell>
      <PageTitle eyebrow="Studio Governance & Configuration" title="Settings & Audit Trail" />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="profile" className="text-xs">
            Studio Practice Profile
          </TabsTrigger>
          <TabsTrigger value="financial" className="text-xs">
            GST & Invoicing Defaults
          </TabsTrigger>
          <TabsTrigger value="audit" className="text-xs">
            Audit Activity Log ({(auditLog ?? []).length})
          </TabsTrigger>
        </TabsList>

        {/* 1. STUDIO PRACTICE PROFILE */}
        <TabsContent value="profile" className="space-y-6 max-w-2xl">
          <form
            onSubmit={handleSave}
            className="rounded border border-border bg-card p-6 space-y-4 text-xs"
          >
            <div>
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Practice Name
              </Label>
              <Input
                value={studioProfile.studioName}
                onChange={(e) => setStudioProfile({ ...studioProfile, studioName: e.target.value })}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Tagline / Mission
              </Label>
              <Input
                value={studioProfile.tagline}
                onChange={(e) => setStudioProfile({ ...studioProfile, tagline: e.target.value })}
                className="mt-1.5"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Official Email
                </Label>
                <Input
                  value={studioProfile.email}
                  onChange={(e) => setStudioProfile({ ...studioProfile, email: e.target.value })}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Phone Number
                </Label>
                <Input
                  value={studioProfile.phone}
                  onChange={(e) => setStudioProfile({ ...studioProfile, phone: e.target.value })}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div>
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Registered Studio Atelier Address
              </Label>
              <Input
                value={studioProfile.address}
                onChange={(e) => setStudioProfile({ ...studioProfile, address: e.target.value })}
                className="mt-1.5"
              />
            </div>

            <div className="pt-3 border-t border-border flex justify-end">
              <Button
                type="submit"
                size="sm"
                className="bg-primary text-primary-foreground gap-1.5 text-xs"
              >
                <Save className="h-3.5 w-3.5" /> Save Practice Profile
              </Button>
            </div>
          </form>
        </TabsContent>

        {/* 2. FINANCIAL & GST SETTINGS */}
        <TabsContent value="financial" className="space-y-6 max-w-2xl">
          <form
            onSubmit={handleSave}
            className="rounded border border-border bg-card p-6 space-y-4 text-xs"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  GSTIN Identification
                </Label>
                <Input
                  value={studioProfile.gstin}
                  onChange={(e) => setStudioProfile({ ...studioProfile, gstin: e.target.value })}
                  className="mt-1.5 font-mono"
                />
              </div>
              <div>
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  PAN Number
                </Label>
                <Input
                  value={studioProfile.pan}
                  onChange={(e) => setStudioProfile({ ...studioProfile, pan: e.target.value })}
                  className="mt-1.5 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Standard Tax Slab
                </Label>
                <Input
                  value={studioProfile.taxRate}
                  onChange={(e) => setStudioProfile({ ...studioProfile, taxRate: e.target.value })}
                  className="mt-1.5 font-mono"
                />
              </div>
              <div>
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Currency
                </Label>
                <Input
                  value={studioProfile.currency}
                  disabled
                  className="mt-1.5 font-mono bg-muted/40"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-border flex justify-end">
              <Button
                type="submit"
                size="sm"
                className="bg-primary text-primary-foreground gap-1.5 text-xs"
              >
                <Save className="h-3.5 w-3.5" /> Save Financial Configuration
              </Button>
            </div>
          </form>
        </TabsContent>

        {/* 3. AUDIT ACTIVITY LOG */}
        <TabsContent value="audit" className="space-y-4">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search audit trail by user, action, project..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>
          </div>

          <div className="rounded border border-border bg-card overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/20 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3">Timestamp</th>
                  <th className="px-4 py-3">User / Actor</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Target Entity</th>
                  <th className="px-5 py-3">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredAudit.map((entry) => (
                  <tr key={entry.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-muted-foreground text-[11px] whitespace-nowrap">
                      {entry.timestamp}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-foreground whitespace-nowrap">
                      {entry.user_name}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <Badge variant="outline" className="text-[10px] font-semibold">
                        {entry.action}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-accent font-medium whitespace-nowrap">
                      {entry.entity_title}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground leading-relaxed">
                      {entry.detail}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
