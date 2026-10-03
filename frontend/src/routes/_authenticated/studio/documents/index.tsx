import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  FileText,
  Search,
  CheckCircle2,
  Clock,
  Download,
  Upload,
  Eye,
  Layers,
  FileCheck,
  FolderKanban,
} from "lucide-react";
import { AppShell, EmptyState, PageTitle, shortDate } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { INITIAL_DOCUMENTS } from "@/lib/studio-mock-data";

export const Route = createFileRoute("/_authenticated/studio/documents/")({
  component: DocumentsPage,
  head: () => ({
    meta: [
      { title: "Designs & Documents Vault — Right-Angle-Design-Studio" },
      {
        name: "description",
        content:
          "Working drawings, 2D CAD sets, 3D visualizations, material schedules, and contracts.",
      },
    ],
  }),
});

const CATEGORIES = [
  "all",
  "2D Drawings",
  "3D Designs",
  "Electrical",
  "Material Boards",
  "Contracts",
] as const;

function DocumentsPage() {
  const [docs, setDocs] = useState(INITIAL_DOCUMENTS);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");

  const filteredDocs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return docs.filter((d) => {
      if (category !== "all" && d.category !== category) return false;
      if (!q) return true;
      return [d.title, d.project_title, d.category, d.uploaded_by]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [docs, search, category]);

  const toggleApproval = (id: string) => {
    setDocs((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              is_approved: !d.is_approved,
              status: !d.is_approved ? "approved" : "review_pending",
              version: !d.is_approved ? "Approved" : "V2",
            }
          : d,
      ),
    );
    toast.success("Document approval status updated.");
  };

  return (
    <AppShell>
      <PageTitle
        eyebrow="Architectural Documentation"
        title={`Designs & Documents Vault (${filteredDocs.length})`}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`rounded border px-3 py-1.5 text-xs transition-colors ${
                category === cat
                  ? "border-accent bg-accent/15 text-foreground font-medium"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat === "all" ? "All Documents" : cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search documents, CAD sets, contracts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>
      </div>

      <div className="rounded border border-border bg-card overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/20 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-3">Document Title</th>
              <th className="px-4 py-3">Project</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Version</th>
              <th className="px-4 py-3">Size / Format</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredDocs.map((doc) => (
              <tr key={doc.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-accent/15 text-accent shrink-0">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{doc.title}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Uploaded by {doc.uploaded_by}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-muted-foreground font-medium">
                  {doc.project_title}
                </td>
                <td className="px-4 py-3.5 text-muted-foreground">{doc.category}</td>
                <td className="px-4 py-3.5">
                  <Badge
                    variant={doc.is_approved ? "default" : "secondary"}
                    className="text-[10px] font-mono"
                  >
                    {doc.version}
                  </Badge>
                </td>
                <td className="px-4 py-3.5 font-mono text-muted-foreground">
                  {doc.file_size} · {doc.file_type}
                </td>
                <td className="px-4 py-3.5 text-muted-foreground">{shortDate(doc.upload_date)}</td>
                <td className="px-4 py-3.5">
                  <span
                    className={`text-[11px] font-medium flex items-center gap-1 ${
                      doc.is_approved ? "text-emerald-600" : "text-accent"
                    }`}
                  >
                    {doc.is_approved ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <Clock className="h-3 w-3" />
                    )}
                    {doc.status.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => toggleApproval(doc.id)}
                    >
                      {doc.is_approved ? "Revoke Approval" : "Mark Approved"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={() => toast.info(`Downloading ${doc.title}...`)}
                    >
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
