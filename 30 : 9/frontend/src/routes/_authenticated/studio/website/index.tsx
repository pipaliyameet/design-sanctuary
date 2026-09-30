import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  Globe,
  Star,
  CheckCircle2,
  ExternalLink,
  Eye,
  Sparkles,
  Layers,
  FileText,
  Sliders,
  MessageSquare,
} from "lucide-react";
import { AppShell, EmptyState, PageTitle, Panel, shortDate } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { INITIAL_PROJECTS } from "@/lib/studio-mock-data";

export const Route = createFileRoute("/_authenticated/studio/website/")({
  component: WebsiteCMSPage,
  head: () => ({
    meta: [
      { title: "Website Content Management (CMS) — Atelier Vermilion Studio" },
      {
        name: "description",
        content:
          "Control public portfolio items, featured homepage showcases, editorial services, and reviews.",
      },
    ],
  }),
});

function WebsiteCMSPage() {
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [activeTab, setActiveTab] = useState("portfolio");

  const togglePublish = (id: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, is_featured_on_website: !p.is_featured_on_website } : p,
      ),
    );
    toast.success("Website publishing status updated.");
  };

  const toggleHomepage = (id: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_on_homepage: !p.is_on_homepage } : p)),
    );
    toast.success("Homepage hero carousel updated.");
  };

  return (
    <AppShell>
      <PageTitle
        eyebrow="Public Site Management"
        title="Website Content & Portfolio CMS"
        actions={
          <Button asChild size="sm" variant="outline" className="text-xs">
            <a href="/" target="_blank" rel="noreferrer">
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> View Live Public Site
            </a>
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="portfolio" className="text-xs">
            Portfolio Showcase ({projects.length})
          </TabsTrigger>
          <TabsTrigger value="hero" className="text-xs">
            Homepage Hero & Settings
          </TabsTrigger>
          <TabsTrigger value="testimonials" className="text-xs">
            Client Testimonials (4)
          </TabsTrigger>
        </TabsList>

        {/* 1. PORTFOLIO MANAGER TAB */}
        <TabsContent value="portfolio" className="space-y-4">
          <div className="rounded border border-border bg-card overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/20 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3">Project & Cover</th>
                  <th className="px-4 py-3">Location & Style</th>
                  <th className="px-4 py-3">Portfolio Status</th>
                  <th className="px-4 py-3">Homepage Showcase</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {projects.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.cover_image}
                          alt={p.title}
                          className="h-12 w-16 rounded object-cover border border-border shrink-0"
                        />
                        <div>
                          <p className="font-display font-medium text-sm text-foreground">
                            {p.title}
                          </p>
                          <p className="text-[11px] text-muted-foreground font-mono">
                            {p.code} · {p.area_sqft} sq ft
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      <p className="text-foreground">{p.city}</p>
                      <p className="text-[11px] text-muted-foreground">{p.style}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={p.is_featured_on_website}
                          onCheckedChange={() => togglePublish(p.id)}
                        />
                        <span className="text-xs font-medium">
                          {p.is_featured_on_website ? "Published" : "Draft"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={p.is_on_homepage}
                          onCheckedChange={() => toggleHomepage(p.id)}
                        />
                        <span className="text-xs font-medium">
                          {p.is_on_homepage ? "Featured" : "Standard"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button asChild size="sm" variant="outline" className="h-7 text-xs">
                        <a href={`/portfolio`} target="_blank" rel="noreferrer">
                          Preview <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* 2. HOMEPAGE HERO SETTINGS */}
        <TabsContent value="hero" className="space-y-6">
          <Panel title="Homepage Editorial Headlines & Studio Statement">
            <div className="space-y-4 max-w-2xl text-xs">
              <div>
                <span className="text-[10px] uppercase font-semibold text-muted-foreground">
                  Main Hero Statement
                </span>
                <p className="font-display text-lg text-foreground mt-1 p-3 rounded bg-muted/20 border border-border">
                  &ldquo;We detail residences, villas, and hospitality spaces around daylight, raw
                  stone, and quiet craft.&rdquo;
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-semibold text-muted-foreground">
                  Primary Studio Locations
                </span>
                <p className="text-foreground mt-1 p-2.5 rounded bg-muted/20 border border-border font-mono">
                  Rajkot · Ahmedabad · Mumbai · Vadodara
                </p>
              </div>
            </div>
          </Panel>
        </TabsContent>

        {/* 3. TESTIMONIALS TAB */}
        <TabsContent value="testimonials" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                name: "Ketan Patel",
                title: "Patel Residence, Rajkot",
                quote:
                  "Atelier Vermilion transformed our apartment with stunning travertine and calm joinery. The execution precision was flawless.",
              },
              {
                name: "Pratik Shah",
                title: "Shah Villa, Ahmedabad",
                quote:
                  "The central courtyard and natural daylight management created a true private sanctuary for our multi-generational family.",
              },
              {
                name: "Devang Mehta",
                title: "Mehta Executive Suite, Rajkot",
                quote:
                  "A quiet, architectural workspace that inspires our financial team every day.",
              },
              {
                name: "Vikram Oberoi",
                title: "The Oberoi Penthouse, Mumbai",
                quote: "Flawless attention to custom marble craftsmanship and lighting.",
              },
            ].map((t, idx) => (
              <div key={idx} className="rounded border border-border bg-card p-5 space-y-3">
                <p className="font-serif italic text-sm text-foreground leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="pt-2 border-t border-border flex justify-between items-center text-xs">
                  <div>
                    <p className="font-medium text-foreground">{t.name}</p>
                    <p className="text-[11px] text-muted-foreground">{t.title}</p>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    Published
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
