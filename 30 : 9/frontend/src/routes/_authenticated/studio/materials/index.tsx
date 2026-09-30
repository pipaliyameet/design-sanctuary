import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  Package,
  Search,
  Truck,
  Building,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  Star,
  Layers,
} from "lucide-react";
import { getStudioMaterialsAndVendors, updateMaterialStatus } from "@/lib/studio-admin.functions";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type StudioMaterial } from "@/lib/studio-mock-data";

export const Route = createFileRoute("/_authenticated/studio/materials/")({
  component: MaterialsVendorsPage,
  head: () => ({
    meta: [
      { title: "Materials & Vendor Directory — Atelier Vermilion Studio" },
      {
        name: "description",
        content:
          "Material tracking lifecycle from request to on-site installation, and trusted vendor directory.",
      },
    ],
  }),
});

const MATERIAL_STATUSES = [
  "requested",
  "quoted",
  "approved",
  "ordered",
  "in_transit",
  "delivered",
  "installed",
] as const;

function MaterialsVendorsPage() {
  const queryClient = useQueryClient();
  const fetchInventory = useServerFn(getStudioMaterialsAndVendors);
  const patchStatus = useServerFn(updateMaterialStatus);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["studio", "materials-vendors"],
    queryFn: () => fetchInventory(),
  });

  const [activeTab, setActiveTab] = useState("materials");
  const [search, setSearch] = useState("");

  const statusMutation = useMutation({
    mutationFn: (input: { id: string; status: (typeof MATERIAL_STATUSES)[number] }) =>
      patchStatus({ data: input }),
    onSuccess: () => {
      toast.success("Material status updated.");
      queryClient.invalidateQueries({ queryKey: ["studio"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Update failed"),
  });

  if (isLoading) {
    return (
      <AppShell>
        <LoadingBlock label="Loading material ledger & vendor directory…" />
      </AppShell>
    );
  }

  if (error || !data) {
    return (
      <AppShell>
        <ErrorBlock error={error || new Error("Failed to load")} onRetry={() => refetch()} />
      </AppShell>
    );
  }

  const { materials, vendors } = data;

  const filteredMaterials = materials.filter((m) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return [m.name, m.brand, m.vendor_name, m.project_title, m.room_name]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q));
  });

  const filteredVendors = vendors.filter((v) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return [v.name, v.category, v.contact_person, v.city]
      .filter(Boolean)
      .some((val) => String(val).toLowerCase().includes(q));
  });

  return (
    <AppShell>
      <PageTitle eyebrow="Procurement & Supply Chain" title="Materials & Vendor Ledger" />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="materials" className="text-xs">
              Materials Tracker ({materials.length})
            </TabsTrigger>
            <TabsTrigger value="vendors" className="text-xs">
              Vendor Directory ({vendors.length})
            </TabsTrigger>
          </TabsList>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search materials, brands, vendors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>
        </div>

        {/* 1. MATERIALS TRACKER TAB */}
        <TabsContent value="materials" className="space-y-4">
          <div className="rounded border border-border bg-card overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/20 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3">Material & Brand</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Project & Room</th>
                  <th className="px-4 py-3">Vendor</th>
                  <th className="px-4 py-3 text-right">Quantity</th>
                  <th className="px-4 py-3 text-right">Total Cost</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-mono">
                {filteredMaterials.map((mat) => (
                  <tr key={mat.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5 font-sans">
                      <p className="font-medium text-foreground">{mat.name}</p>
                      <p className="text-[11px] text-muted-foreground">{mat.brand}</p>
                    </td>
                    <td className="px-4 py-3.5 font-sans text-muted-foreground">{mat.category}</td>
                    <td className="px-4 py-3.5 font-sans">
                      <p className="font-medium text-foreground">{mat.project_title}</p>
                      <p className="text-[11px] text-muted-foreground">{mat.room_name}</p>
                    </td>
                    <td className="px-4 py-3.5 font-sans text-muted-foreground">
                      {mat.vendor_name}
                    </td>
                    <td className="px-4 py-3.5 text-right text-muted-foreground">
                      {mat.quantity} {mat.unit}
                    </td>
                    <td className="px-4 py-3.5 text-right font-medium text-foreground">
                      {inr(mat.total_cost)}
                    </td>
                    <td className="px-4 py-3.5 font-sans">
                      <Badge
                        variant={
                          mat.status === "installed"
                            ? "default"
                            : mat.status === "in_transit"
                              ? "secondary"
                              : "outline"
                        }
                        className="text-[10px] uppercase font-semibold"
                      >
                        {mat.status.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right font-sans">
                      <Select
                        value={mat.status}
                        onValueChange={(val: (typeof MATERIAL_STATUSES)[number]) =>
                          statusMutation.mutate({ id: mat.id, status: val })
                        }
                      >
                        <SelectTrigger className="h-7 w-28 text-[10px] bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {MATERIAL_STATUSES.map((s) => (
                            <SelectItem key={s} value={s} className="text-xs">
                              {s.replace(/_/g, " ").toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* 2. VENDORS DIRECTORY TAB */}
        <TabsContent value="vendors" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {filteredVendors.map((vendor) => (
              <div
                key={vendor.id}
                className="rounded border border-border bg-card p-5 space-y-4 hover:border-accent/60 transition-colors"
              >
                <div className="flex items-start justify-between border-b border-border pb-3">
                  <div>
                    <h3 className="font-display text-lg font-medium text-foreground">
                      {vendor.name}
                    </h3>
                    <p className="text-xs text-accent font-medium mt-0.5">
                      {vendor.category} · {vendor.city}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs font-mono">
                    ★ {vendor.rating}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] uppercase text-muted-foreground">
                      Contact Representative
                    </span>
                    <p className="font-medium text-foreground mt-0.5">{vendor.contact_person}</p>
                    <p className="text-muted-foreground">{vendor.phone}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-muted-foreground">
                      Total Spend & Balance
                    </span>
                    <p className="font-mono font-medium text-foreground mt-0.5">
                      {inr(vendor.total_spent)}
                    </p>
                    <p className="font-mono text-muted-foreground text-[11px]">
                      Outstanding: {inr(vendor.outstanding_balance)}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground bg-muted/30 p-2.5 rounded leading-relaxed">
                  {vendor.notes}
                </p>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
