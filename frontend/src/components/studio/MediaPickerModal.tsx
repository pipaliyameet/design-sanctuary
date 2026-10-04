import React, { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Check, X, Image as ImageIcon, Sparkles, Filter, CheckCircle2, ArrowRight } from "lucide-react";
import { mediaService } from "@/services/media.service";
import { GOOGLE_DRIVE_PHOTOS } from "@/lib/google-drive-photos";
import { DriveImage } from "@/components/site/DriveImage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export interface MediaPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectMedia: (photoUrl: string, mediaItem?: any) => void;
  title?: string;
  description?: string;
  currentUrl?: string;
}

export function MediaPickerModal({
  open,
  onOpenChange,
  onSelectMedia,
  title = "Select Google Drive Photograph",
  description = "Browse real high-resolution photographs from the studio's Google Drive archive.",
  currentUrl,
}: MediaPickerModalProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedItem, setSelectedItem] = useState<{ url: string; title: string; category?: string } | null>(null);

  // Fetch registered MongoDB media
  const { data: dbMedia } = useQuery({
    queryKey: ["media", "picker"],
    queryFn: () => mediaService.list(),
    enabled: open,
  });

  // Combine Google Drive Photos with DB records
  const allPhotos = useMemo(() => {
    const list: Array<{ url: string; title: string; category: string; tags: string[]; room?: string }> = [];

    // Add curated drive photos
    for (const p of GOOGLE_DRIVE_PHOTOS) {
      list.push({
        url: p.url,
        title: p.title || p.fileName || "Studio Photo",
        category: p.category || "Living",
        tags: p.tags || [],
        room: (p as any).room,
      });
    }

    // Add any extra DB media items if available
    if (dbMedia && Array.isArray(dbMedia)) {
      for (const m of dbMedia) {
        const directUrl =
          m.driveUrl ||
          m.thumbnailUrl ||
          (m.driveFileId ? `https://lh3.googleusercontent.com/d/${m.driveFileId}` : "");
        if (directUrl && !list.some((existing) => existing.url === directUrl)) {
          list.push({
            url: directUrl,
            title: m.caption || m.fileName || "Studio Media",
            category: m.category || "Living",
            tags: m.tags || [],
            room: m.room || undefined,
          });
        }
      }
    }

    return list;
  }, [dbMedia]);

  // Set default selection to currently active URL when modal opens
  useEffect(() => {
    if (open) {
      if (currentUrl) {
        const match = allPhotos.find((p) => p.url === currentUrl);
        if (match) {
          setSelectedItem(match);
        } else {
          setSelectedItem({ url: currentUrl, title: "Current Image", category: "Current" });
        }
      } else if (allPhotos.length > 0 && !selectedItem) {
        setSelectedItem(allPhotos[0] || null);
      }
    }
  }, [open, currentUrl, allPhotos]);

  const categories = useMemo(() => {
    const set = new Set<string>(["All"]);
    allPhotos.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [allPhotos]);

  const filteredPhotos = useMemo(() => {
    let result = allPhotos;
    if (selectedCategory !== "All") {
      result = result.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    return result;
  }, [allPhotos, selectedCategory, search]);

  const handleConfirm = () => {
    if (selectedItem) {
      onSelectMedia(selectedItem.url, selectedItem);
      onOpenChange(false);
    }
  };

  const handleDoubleClick = (photo: { url: string; title: string; category?: string }) => {
    setSelectedItem(photo);
    onSelectMedia(photo.url, photo);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] max-h-[780px] flex flex-col p-5 sm:p-6 bg-card border-border shadow-2xl overflow-hidden">
        {/* Header */}
        <DialogHeader className="shrink-0 pb-2 border-b border-border">
          <DialogTitle className="font-display text-xl font-medium flex items-center gap-2">
            <span>{title}</span>
            <Badge variant="outline" className="text-[10px] font-mono text-accent border-accent/40 bg-accent/10">
              Google Drive Vault
            </Badge>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {description} Click any photograph to select, or double-click to immediately apply.
          </DialogDescription>
        </DialogHeader>

        {/* Filters and Search Bar */}
        <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3 py-2.5">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search photographs by room, category, or tag…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs h-9 bg-background/50"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-[11px] uppercase tracking-wider font-medium border rounded transition-colors shrink-0 cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-accent text-accent-foreground border-accent font-semibold"
                    : "bg-muted/40 text-muted-foreground border-border hover:text-foreground hover:bg-muted"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Media Grid & Preview Pane */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1 min-h-0 overflow-hidden py-1">
          {/* Left: Photos Grid */}
          <div className="md:col-span-8 overflow-y-auto pr-1 h-full rounded border border-border/50 p-2 bg-background/30">
            {filteredPhotos.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full border border-dashed border-border rounded text-center p-6 text-muted-foreground">
                <ImageIcon className="size-8 stroke-[1.5] mb-2 opacity-60" />
                <p className="text-xs font-medium">No matching Google Drive photographs found.</p>
                <p className="text-[11px] mt-1">Try refining your search terms or category filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                {filteredPhotos.map((photo, idx) => {
                  const isSelected = selectedItem?.url === photo.url;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedItem(photo)}
                      onDoubleClick={() => handleDoubleClick(photo)}
                      className={`group relative aspect-[4/3] rounded overflow-hidden border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "ring-2 ring-accent border-accent shadow-md scale-[1.02]"
                          : "border-border/70 hover:border-accent/70 hover:scale-[1.01]"
                      }`}
                    >
                      <DriveImage
                        src={photo.url}
                        alt={photo.title}
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 size-5 bg-accent text-accent-foreground rounded-full flex items-center justify-center shadow-md">
                          <Check className="size-3 stroke-[3]" />
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-[10px] text-white truncate font-medium">{photo.title}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Large Detail Preview & Direct Change Action Pane */}
          <div className="md:col-span-4 border border-border bg-card/60 p-4 flex flex-col justify-between rounded-lg shadow-inner h-full overflow-y-auto">
            {selectedItem ? (
              <div className="space-y-3">
                <div className="relative aspect-[16/11] overflow-hidden border-2 border-accent/40 bg-black/40 rounded-md shadow">
                  <DriveImage
                    src={selectedItem.url}
                    alt={selectedItem.title}
                    className="size-full object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-black/75 text-accent border-accent/30 text-[9px] uppercase tracking-wider backdrop-blur-sm">
                      Selected Preview
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="text-[9px] uppercase tracking-wider text-muted-foreground">
                      {selectedItem.category || "Living"}
                    </Badge>
                    <span className="text-[10px] text-accent font-mono">Google Drive Asset</span>
                  </div>
                  <h4 className="font-display text-base font-medium text-foreground leading-snug">
                    {selectedItem.title}
                  </h4>
                </div>

                {/* Prominent Direct Change Button in Preview */}
                <div className="pt-2">
                  <Button
                    onClick={handleConfirm}
                    className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold text-xs tracking-wider uppercase h-10 shadow-md flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="size-4" />
                    <span>Change To This Image</span>
                  </Button>
                  <p className="text-[10px] text-center text-muted-foreground mt-1.5 font-mono">
                    Click above or press "Apply Changes" below
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
                <Sparkles className="size-8 stroke-[1.5] mb-2 text-accent animate-pulse" />
                <p className="text-xs font-medium text-foreground">Select Any Photograph</p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Click a photo from the gallery to preview and apply it to this section.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Dedicated Fixed Bottom Action Footer */}
        <DialogFooter className="shrink-0 pt-3 border-t border-border mt-2 flex flex-row items-center justify-between gap-3 sm:justify-between">
          <div className="flex items-center gap-2 text-left truncate max-w-[50%]">
            {selectedItem ? (
              <div className="truncate">
                <span className="text-[10px] uppercase font-mono text-muted-foreground block">Ready to Apply:</span>
                <p className="text-xs font-medium text-foreground truncate">{selectedItem.title}</p>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">No image chosen yet</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-9 px-4 cursor-pointer"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!selectedItem}
              className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold text-xs h-9 px-5 shadow tracking-wider uppercase flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              onClick={handleConfirm}
            >
              <Check className="size-3.5 stroke-[3]" />
              <span>Change Image & Apply</span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
