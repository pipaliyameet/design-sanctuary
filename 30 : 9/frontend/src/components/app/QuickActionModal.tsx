import { useState } from "react";
import { toast } from "sonner";
import {
  FolderPlus,
  UserPlus,
  ImagePlus,
  FileSpreadsheet,
  Receipt,
  Camera,
  X,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createStudioProject,
  uploadStudioMedia,
  createStudioQuotation,
  addStudioExpense,
  addStudioSiteUpdate,
} from "@/lib/studio-admin.functions";
import { INITIAL_PROJECTS } from "@/lib/studio-mock-data";
import { GOOGLE_DRIVE_PHOTOS } from "@/lib/google-drive-photos";

export type QuickActionType =
  "project" | "lead" | "client" | "media" | "quotation" | "expense" | "site_update";

export function QuickActionModal({
  isOpen,
  actionType,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  actionType: QuickActionType;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [loading, setLoading] = useState(false);

  // Form states
  const [projectForm, setProjectForm] = useState({
    title: "",
    client_name: "",
    client_email: "",
    client_phone: "+91 ",
    city: "Rajkot, Gujarat",
    space_type: "3BHK Luxury Apartment",
    style: "Architectural Minimalist",
    area_sqft: 2500,
    budget_amount: 2000000,
    target_date: "2026-12-31",
    lead_designer_name: "Ira Kapoor",
    description: "",
  });

  const [leadForm, setLeadForm] = useState({
    name: "",
    email: "",
    phone: "+91 ",
    city: "Ahmedabad, Gujarat",
    property_type: "4BHK Villa",
    budget_band: "₹25L – ₹40L",
    estimated_value: 3000000,
    source: "Website" as const,
    notes: "",
  });

  const [mediaForm, setMediaForm] = useState({
    project_id: INITIAL_PROJECTS[0]?.id || "proj-patel",
    category: "3d_renders" as const,
    title: "",
    description: "",
    url: GOOGLE_DRIVE_PHOTOS[0]?.url || "",
    tags: "Living Room, Travertine",
    visibility: "website" as const,
  });

  const [expenseForm, setExpenseForm] = useState({
    project_id: INITIAL_PROJECTS[0]?.id || "proj-patel",
    category: "Materials" as const,
    description: "",
    vendor_name: "",
    amount: 50000,
    paid_by: "Studio Corporate Card",
  });

  const [siteUpdateForm, setSiteUpdateForm] = useState({
    project_id: INITIAL_PROJECTS[0]?.id || "proj-patel",
    title: "",
    work_completed: "",
    work_pending: "",
    issues: "",
    next_action: "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (actionType === "project") {
        await createStudioProject({ data: projectForm });
        toast.success(`Project "${projectForm.title}" created successfully.`);
      } else if (actionType === "media") {
        await uploadStudioMedia({
          data: {
            ...mediaForm,
            tags: mediaForm.tags.split(",").map((t) => t.trim()),
          },
        });
        toast.success(`Media asset "${mediaForm.title}" saved to library.`);
      } else if (actionType === "expense") {
        await addStudioExpense({
          data: {
            ...expenseForm,
            date: new Date().toISOString().slice(0, 10),
          },
        });
        toast.success(`Expense of ₹${expenseForm.amount.toLocaleString("en-IN")} recorded.`);
      } else if (actionType === "site_update") {
        await addStudioSiteUpdate({
          data: {
            ...siteUpdateForm,
            photos: [GOOGLE_DRIVE_PHOTOS[10]?.url || GOOGLE_DRIVE_PHOTOS[0]?.url],
          },
        });
        toast.success(`Daily site log posted.`);
      } else {
        toast.success("Action completed successfully.");
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to perform action");
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (actionType) {
      case "project":
        return "New Interior Project";
      case "lead":
        return "Add New Studio Lead";
      case "client":
        return "Add Client Profile";
      case "media":
        return "Upload Project Media / Render";
      case "quotation":
        return "Create Client Quotation";
      case "expense":
        return "Record Studio / Project Expense";
      case "site_update":
        return "Post Daily Site Execution Log";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl overflow-hidden rounded-md border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <p className="eyebrow">Studio Command</p>
            <h2 className="mt-1 font-display text-xl leading-tight text-foreground">
              {getTitle()}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {actionType === "project" && (
            <>
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Project Title
                </Label>
                <Input
                  required
                  placeholder="e.g. Sunrise Penthouse"
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                  className="mt-1.5"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                    Client Name
                  </Label>
                  <Input
                    required
                    placeholder="e.g. Ketan Patel"
                    value={projectForm.client_name}
                    onChange={(e) =>
                      setProjectForm({ ...projectForm, client_name: e.target.value })
                    }
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                    Client Phone
                  </Label>
                  <Input
                    required
                    placeholder="+91 98..."
                    value={projectForm.client_phone}
                    onChange={(e) =>
                      setProjectForm({ ...projectForm, client_phone: e.target.value })
                    }
                    className="mt-1.5"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                    City / Location
                  </Label>
                  <Input
                    required
                    placeholder="e.g. Rajkot, Gujarat"
                    value={projectForm.city}
                    onChange={(e) => setProjectForm({ ...projectForm, city: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                    Budget (₹ INR)
                  </Label>
                  <Input
                    required
                    type="number"
                    value={projectForm.budget_amount}
                    onChange={(e) =>
                      setProjectForm({ ...projectForm, budget_amount: Number(e.target.value) })
                    }
                    className="mt-1.5"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                    Area (Sq Ft)
                  </Label>
                  <Input
                    required
                    type="number"
                    value={projectForm.area_sqft}
                    onChange={(e) =>
                      setProjectForm({ ...projectForm, area_sqft: Number(e.target.value) })
                    }
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                    Target Completion
                  </Label>
                  <Input
                    required
                    type="date"
                    value={projectForm.target_date}
                    onChange={(e) =>
                      setProjectForm({ ...projectForm, target_date: e.target.value })
                    }
                    className="mt-1.5"
                  />
                </div>
              </div>
            </>
          )}

          {actionType === "media" && (
            <>
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Associated Project
                </Label>
                <Select
                  value={mediaForm.project_id}
                  onValueChange={(val) => setMediaForm({ ...mediaForm, project_id: val })}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select Project" />
                  </SelectTrigger>
                  <SelectContent>
                    {INITIAL_PROJECTS.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.code} · {p.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Category
                </Label>
                <Select
                  value={mediaForm.category}
                  onValueChange={(val: typeof mediaForm.category) =>
                    setMediaForm({ ...mediaForm, category: val })
                  }
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3d_renders">3D Photorealistic Render</SelectItem>
                    <SelectItem value="site_photos">On-Site Progress Photo</SelectItem>
                    <SelectItem value="final_photos">Final Professional Photography</SelectItem>
                    <SelectItem value="before_after">Before & After Slider</SelectItem>
                    <SelectItem value="floor_plans">2D / 3D Floor Plan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Title / Room Caption
                </Label>
                <Input
                  required
                  placeholder="e.g. Master Bedroom Sanctuary Daylight View"
                  value={mediaForm.title}
                  onChange={(e) => setMediaForm({ ...mediaForm, title: e.target.value })}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Upload Local File (Drive Storage) or Preset
                </Label>
                <div className="mt-1.5 space-y-2">
                  <Input
                    type="file"
                    accept="image/*,video/*,application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          const base64 = reader.result as string;
                          (setMediaForm as any)((prev: any) => ({
                            ...prev,
                            base64_data: base64,
                            file_name: file.name,
                            mime_type: file.type,
                            title: prev.title || file.name.replace(/\.[^/.]+$/, ""),
                          }));
                          toast.success(`Selected file: ${file.name}`);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-accent file:text-accent-foreground"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground uppercase">
                      Or select image path:
                    </span>
                    <Select
                      value={mediaForm.url}
                      onValueChange={(val) => setMediaForm({ ...mediaForm, url: val })}
                    >
                      <SelectTrigger className="h-7 text-xs flex-1">
                        <SelectValue placeholder="Choose image asset" />
                      </SelectTrigger>
                      <SelectContent>
                        {GOOGLE_DRIVE_PHOTOS.slice(0, 10).map((photo) => (
                          <SelectItem key={photo.id} value={photo.url}>
                            {photo.title} ({photo.category})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </>
          )}

          {actionType === "expense" && (
            <>
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Project (Optional)
                </Label>
                <Select
                  value={expenseForm.project_id}
                  onValueChange={(val) => setExpenseForm({ ...expenseForm, project_id: val })}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select Project" />
                  </SelectTrigger>
                  <SelectContent>
                    {INITIAL_PROJECTS.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.code} · {p.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                    Category
                  </Label>
                  <Select
                    value={expenseForm.category}
                    onValueChange={(val: typeof expenseForm.category) =>
                      setExpenseForm({ ...expenseForm, category: val })
                    }
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Materials">Materials</SelectItem>
                      <SelectItem value="Labour / Contractor">Labour / Contractor</SelectItem>
                      <SelectItem value="Site Logistics">Site Logistics</SelectItem>
                      <SelectItem value="Software & Licenses">Software & Licenses</SelectItem>
                      <SelectItem value="Studio Rent & Utilities">
                        Studio Rent & Utilities
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                    Amount (₹ INR)
                  </Label>
                  <Input
                    required
                    type="number"
                    value={expenseForm.amount}
                    onChange={(e) =>
                      setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })
                    }
                    className="mt-1.5"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Vendor / Payee
                </Label>
                <Input
                  required
                  placeholder="e.g. Stones & Craft Gujarat"
                  value={expenseForm.vendor_name}
                  onChange={(e) => setExpenseForm({ ...expenseForm, vendor_name: e.target.value })}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Description / Notes
                </Label>
                <Input
                  required
                  placeholder="e.g. Italian Travertine slab cutting and delivery"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  className="mt-1.5"
                />
              </div>
            </>
          )}

          {actionType === "site_update" && (
            <>
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Project Site
                </Label>
                <Select
                  value={siteUpdateForm.project_id}
                  onValueChange={(val) => setSiteUpdateForm({ ...siteUpdateForm, project_id: val })}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select Project" />
                  </SelectTrigger>
                  <SelectContent>
                    {INITIAL_PROJECTS.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.code} · {p.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Milestone / Log Title
                </Label>
                <Input
                  required
                  placeholder="e.g. False ceiling plastering and perimeter LED channel fixing"
                  value={siteUpdateForm.title}
                  onChange={(e) => setSiteUpdateForm({ ...siteUpdateForm, title: e.target.value })}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Work Completed Today
                </Label>
                <Input
                  required
                  placeholder="e.g. 100% channel grid aligned with 12mm shadow line reveal"
                  value={siteUpdateForm.work_completed}
                  onChange={(e) =>
                    setSiteUpdateForm({ ...siteUpdateForm, work_completed: e.target.value })
                  }
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Next Action Scheduled
                </Label>
                <Input
                  required
                  placeholder="e.g. First coat lime wax primer application"
                  value={siteUpdateForm.next_action}
                  onChange={(e) =>
                    setSiteUpdateForm({ ...siteUpdateForm, next_action: e.target.value })
                  }
                  className="mt-1.5"
                />
              </div>
            </>
          )}

          {/* Footer Actions */}
          <div className="mt-6 flex items-center justify-end gap-3 border-t border-border pt-4">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading}
              className="bg-primary text-primary-foreground"
            >
              {loading ? "Processing..." : "Save Record"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
