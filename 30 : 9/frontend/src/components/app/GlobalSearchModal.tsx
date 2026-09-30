import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Search,
  FolderKanban,
  Users,
  UserCheck,
  Image as ImageIcon,
  FileText,
  Receipt,
  Package,
  Layers,
  Sparkles,
  ArrowRight,
  X,
} from "lucide-react";
import {
  INITIAL_PROJECTS,
  INITIAL_CLIENTS,
  INITIAL_LEADS,
  INITIAL_MEDIA,
  INITIAL_DOCUMENTS,
  INITIAL_QUOTATIONS,
  INITIAL_MATERIALS,
  INITIAL_VENDORS,
} from "@/lib/studio-mock-data";

interface SearchResult {
  id: string;
  category:
    "Projects" | "Clients" | "Leads" | "Media" | "Documents" | "Quotations" | "Materials & Vendors";
  title: string;
  subtitle: string;
  url: string;
  badge?: string;
}

export function GlobalSearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggle
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const results: SearchResult[] = [];

  if (q.length > 0) {
    // 1. Search Projects
    INITIAL_PROJECTS.forEach((p) => {
      if (
        p.title.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.client_name.toLowerCase().includes(q)
      ) {
        results.push({
          id: p.id,
          category: "Projects",
          title: `${p.code} · ${p.title}`,
          subtitle: `${p.client_name} · ${p.city} · ${p.stage}`,
          url: `/studio/projects/${p.id}`,
          badge: `${p.progress}% Complete`,
        });
      }
    });

    // 2. Search Clients
    INITIAL_CLIENTS.forEach((c) => {
      if (
        c.name.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
      ) {
        results.push({
          id: c.id,
          category: "Clients",
          title: c.name,
          subtitle: `${c.city} · ₹${(c.total_contract_value / 100000).toFixed(1)}L total · ${c.total_projects} projects`,
          url: `/studio/clients`,
          badge: c.status,
        });
      }
    });

    // 3. Search Leads
    INITIAL_LEADS.forEach((l) => {
      if (
        l.name.toLowerCase().includes(q) ||
        l.city.toLowerCase().includes(q) ||
        l.property_type.toLowerCase().includes(q)
      ) {
        results.push({
          id: l.id,
          category: "Leads",
          title: l.name,
          subtitle: `${l.property_type} in ${l.city} · Est. ₹${(l.estimated_value / 100000).toFixed(1)}L`,
          url: `/studio/leads`,
          badge: l.stage.toUpperCase(),
        });
      }
    });

    // 4. Search Media
    INITIAL_MEDIA.forEach((m) => {
      if (
        m.title.toLowerCase().includes(q) ||
        m.project_title.toLowerCase().includes(q) ||
        m.tags.some((t) => t.toLowerCase().includes(q))
      ) {
        results.push({
          id: m.id,
          category: "Media",
          title: m.title,
          subtitle: `${m.project_title} · ${m.category.replace(/_/g, " ")}`,
          url: `/studio/media`,
          badge: m.visibility,
        });
      }
    });

    // 5. Search Documents
    INITIAL_DOCUMENTS.forEach((d) => {
      if (
        d.title.toLowerCase().includes(q) ||
        d.project_title.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q)
      ) {
        results.push({
          id: d.id,
          category: "Documents",
          title: d.title,
          subtitle: `${d.project_title} · ${d.category} · ${d.version}`,
          url: `/studio/documents`,
          badge: d.status,
        });
      }
    });

    // 6. Search Quotations
    INITIAL_QUOTATIONS.forEach((quot) => {
      if (
        quot.number.toLowerCase().includes(q) ||
        quot.project_title.toLowerCase().includes(q) ||
        quot.client_name.toLowerCase().includes(q)
      ) {
        results.push({
          id: quot.id,
          category: "Quotations",
          title: `${quot.number} · ${quot.project_title}`,
          subtitle: `${quot.client_name} · ₹${(quot.grand_total / 100000).toFixed(2)}L · ${quot.version}`,
          url: `/studio/quotations`,
          badge: quot.status.toUpperCase(),
        });
      }
    });

    // 7. Search Materials & Vendors
    INITIAL_MATERIALS.forEach((mat) => {
      if (
        mat.name.toLowerCase().includes(q) ||
        mat.brand.toLowerCase().includes(q) ||
        mat.vendor_name.toLowerCase().includes(q)
      ) {
        results.push({
          id: mat.id,
          category: "Materials & Vendors",
          title: mat.name,
          subtitle: `${mat.brand} from ${mat.vendor_name} · ${mat.project_title}`,
          url: `/studio/materials`,
          badge: mat.status.toUpperCase(),
        });
      }
    });

    INITIAL_VENDORS.forEach((v) => {
      if (
        v.name.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q) ||
        v.contact_person.toLowerCase().includes(q)
      ) {
        results.push({
          id: v.id,
          category: "Materials & Vendors",
          title: v.name,
          subtitle: `${v.category} · ${v.city} · ${v.contact_person}`,
          url: `/studio/materials`,
          badge: `★ ${v.rating}`,
        });
      }
    });
  }

  const handleSelect = (url: string) => {
    onClose();
    navigate({ to: url });
  };

  const getCategoryIcon = (cat: SearchResult["category"]) => {
    switch (cat) {
      case "Projects":
        return <FolderKanban className="h-4 w-4 text-accent" />;
      case "Clients":
        return <Users className="h-4 w-4 text-accent" />;
      case "Leads":
        return <UserCheck className="h-4 w-4 text-accent" />;
      case "Media":
        return <ImageIcon className="h-4 w-4 text-accent" />;
      case "Documents":
        return <FileText className="h-4 w-4 text-accent" />;
      case "Quotations":
        return <Receipt className="h-4 w-4 text-accent" />;
      case "Materials & Vendors":
        return <Package className="h-4 w-4 text-accent" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-16 backdrop-blur-sm sm:pt-24 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl overflow-hidden rounded-md border border-border bg-card shadow-2xl">
        {/* Search Header */}
        <div className="flex items-center border-b border-border px-4 py-3.5">
          <Search className="h-5 w-5 text-muted-foreground mr-3 shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, clients, leads, media, documents, BOQ, vendors... (e.g. 'Patel', 'Travertine', 'Shah')"
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-muted-foreground hover:text-foreground mr-2 text-xs"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search Body */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {q.length === 0 ? (
            <div className="py-8 px-4 text-center">
              <Sparkles className="mx-auto h-6 w-6 text-accent mb-2 opacity-80" />
              <p className="text-sm font-medium text-foreground">Quick Studio Command</p>
              <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
                Type any project name, client contact, material brand, quotation number, or site
                supervisor to jump directly to that record.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {[
                  "Patel Residence",
                  "Shah Villa",
                  "Travertine",
                  "Devang Mehta",
                  "Quotation",
                  "Lumina",
                ].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="rounded border border-border bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground hover:border-accent hover:text-foreground"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No studio records matched &ldquo;<span className="text-foreground">{query}</span>
              &rdquo;
            </div>
          ) : (
            <div className="space-y-1">
              <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {results.length} results found
              </p>
              {results.map((item) => (
                <button
                  key={`${item.category}-${item.id}`}
                  onClick={() => handleSelect(item.url)}
                  className="group flex w-full items-center justify-between rounded p-3 text-left transition-colors hover:bg-accent/10 border border-transparent hover:border-accent/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-muted/60">
                      {getCategoryIcon(item.category)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground group-hover:text-accent">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground font-medium">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.subtitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Open</span>
                    <ArrowRight className="h-3.5 w-3.5 text-accent" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between border-t border-border bg-muted/30 px-4 py-2.5 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="rounded border border-border bg-card px-1 py-0.5 text-[10px]">
                Esc
              </kbd>{" "}
              to close
            </span>
            <span>
              <kbd className="rounded border border-border bg-card px-1 py-0.5 text-[10px]">↵</kbd>{" "}
              to select
            </span>
          </div>
          <span>Atelier Vermilion Command</span>
        </div>
      </div>
    </div>
  );
}
