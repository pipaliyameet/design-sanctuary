import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Check, X, Image as ImageIcon, Sparkles, Filter } from "lucide-react";
import { mediaService } from "@/services/media.service";
import { GOOGLE_DRIVE_PHOTOS } from "@/lib/google-drive-photos";
import { DriveImage } from "@/components/site/DriveImage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

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
        const directUrl = m.driveUrl || m.thumbnailUrl || (m.driveFileId ? `https://lh3.googleusercontent.com/d/${m.driveFileId}` : "");
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
          p.tags.some((t) => t.toLowerCase().includes(q))
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[88vh] flex flex-col p-6 bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-medium">{title}</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">{description}</DialogDescription>
        </DialogHeader>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search photographs by room, category, or tag…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs h-9"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-[11px] uppercase tracking-wider font-medium border transition-colors shrink-0 ${
                  selectedCategory === cat
                    ? "bg-foreground text-background border-foreground"
                    : "bg-muted/40 text-muted-foreground border-border hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Media Grid & Preview Pane */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1 overflow-hidden min-h-[360px] max-h-[460px] pt-3">
          {/* Photos Grid */}
          <div className="md:col-span-8 overflow-y-auto pr-1">
            {filteredPhotos.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 border border-dashed border-border rounded text-center p-6 text-muted-foreground">
                <ImageIcon className="size-8 stroke-[1.5] mb-2 opacity-60" />
                <p className="text-xs font-medium">No matching Google Drive photographs found.</p>
                <p className="text-[11px] mt-1">Try refining your search terms or category filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                {filteredPhotos.map((photo, idx) => {
                  const isSelected = selectedItem?.url === photo.url || (!selectedItem && currentUrl === photo.url);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedItem(photo)}
                      className={`group relative aspect-[4/3] overflow-hidden border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "ring-2 ring-accent border-accent"
                          : "border-border/70 hover:border-foreground/60"
                      }`}
                    >
                      <DriveImage
                        src={photo.url}
                        alt={photo.title}
                        className="size-full object-cover transition-transform group-hover:scale-105"
                      />
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 size-5 bg-accent text-accent-foreground rounded-full flex items-center justify-center shadow">
                          <Check className="size-3 stroke-[3]" />
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-[10px] text-white truncate font-medium">{photo.title}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Large Detail Preview Pane */}
          <div className="md:col-span-4 border border-border bg-muted/20 p-4 flex flex-col justify-between rounded">
            {selectedItem ? (
              <div className="space-y-3">
                <div className="relative aspect-[4/3] overflow-hidden border border-border bg-black/40 rounded">
                  <DriveImage
                    src={selectedItem.url}
                    alt={selectedItem.title}
                    className="size-full object-cover"
                  />
                </div>
                <div>
                  <Badge variant="outline" className="text-[9px] uppercase tracking-wider mb-1">
                    {selectedItem.category || "Living"}
                  </Badge>
                  <h4 className="font-display text-sm font-medium text-foreground leading-snug">
                    {selectedItem.title}
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-1 truncate">
                    Google Drive Cloud Asset
                  </p>
                </div>
              </div>
            ) : currentUrl ? (
              <div className="space-y-3">
                <div className="relative aspect-[4/3] overflow-hidden border border-border bg-black/40 rounded">
                  <DriveImage
                    src={currentUrl}
                    alt="Current Selected Photo"
                    className="size-full object-cover"
                  />
                </div>
                <div>
                  <Badge variant="outline" className="text-[9px] uppercase tracking-wider mb-1">
                    Currently Selected
                  </Badge>
                  <p className="text-xs text-muted-foreground truncate">Selected Project Photograph</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
                <Sparkles className="size-6 stroke-[1.5] mb-2 text-accent" />
                <p className="text-xs font-medium">Click any photograph to preview</p>
                <p className="text-[10px] text-muted-foreground mt-1">High-resolution vector-scaled preview</p>
              </div>
            )}

            <div className="flex items-center gap-2 pt-4 border-t border-border mt-auto">
              <Button
                variant="outline"
                size="sm"
                className="w-1/2 text-xs"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={!selectedItem}
                className="w-1/2 text-xs bg-foreground text-background hover:bg-accent hover:text-accent-foreground"
                onClick={handleConfirm}
              >
                Use This Photo
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
