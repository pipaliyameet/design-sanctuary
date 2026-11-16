import { useState, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Film,
  Search,
  Check,
  UploadCloud,
  ExternalLink,
  Play,
  RotateCcw,
  CheckCircle2,
  HardDrive,
  Sparkles,
} from "lucide-react";
import { mediaService } from "@/services/media.service";
import {
  KNOWN_DRIVE_VIDEOS,
  extractDriveFileId,
  buildDriveVideoUrls,
  resolveVideoStreamUrl,
  GOOGLE_DRIVE_VIDEOS_FOLDER_URL,
  type DriveVideo,
} from "@/lib/google-drive-videos";
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
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface SelectedReelData {
  streamUrl: string;
  driveFileId?: string;
  title?: string;
  posterUrl?: string;
  driveEmbedUrl?: string;
  category?: string;
  location?: string;
  description?: string;
}

export interface DriveReelPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectReel: (reel: SelectedReelData) => void;
  currentStreamUrl?: string;
}

export function DriveReelPickerModal({
  open,
  onOpenChange,
  onSelectReel,
  currentStreamUrl,
}: DriveReelPickerModalProps) {
  const [search, setSearch] = useState("");
  const [pastedUrl, setPastedUrl] = useState("");
  const [previewingVideoId, setPreviewingVideoId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch registered MongoDB media
  const { data: dbMedia, refetch, isFetching } = useQuery({
    queryKey: ["media", "reels-picker"],
    queryFn: () => mediaService.list(),
    enabled: open,
  });

  // Consolidate Drive videos from MongoDB and curated vault
  const allReels = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      streamUrl: string;
      driveFileId?: string;
      posterUrl?: string;
      driveEmbedUrl?: string;
      category?: string;
      location?: string;
      description?: string;
      fileName?: string;
      source: "database" | "vault";
    }> = [];

    // 1. Add MongoDB video assets
    if (dbMedia && Array.isArray(dbMedia)) {
      dbMedia.forEach((m: any) => {
        const isVid =
          m.mediaType === "video" ||
          m.mimeType?.startsWith("video/") ||
          m.fileName?.match(/\.(mp4|mov|webm|m4v)$/i);

        if (isVid) {
          const driveId = m.driveFileId;
          const urls = driveId ? buildDriveVideoUrls(driveId) : null;
          list.push({
            id: m.id || m._id,
            title: m.caption || m.title || m.fileName || "Studio Reel",
            streamUrl: urls?.streamUrl || m.url || m.driveUrl || "",
            driveFileId: driveId,
            posterUrl: m.thumbnailUrl || m.thumbnail_url || urls?.posterUrl,
            driveEmbedUrl: urls?.driveEmbedUrl,
            category: m.category || "Walkthrough",
            location: m.projectTitle || m.project_title || "Studio Project",
            description: m.description || m.alt,
            fileName: m.fileName,
            source: "database",
          });
        }
      });
    }

    // 2. Add Known Curated Drive Videos (if not already included)
    KNOWN_DRIVE_VIDEOS.forEach((k: DriveVideo) => {
      const exists = list.some(
        (item) => item.driveFileId === k.driveFileId || item.streamUrl === k.streamUrl
      );
      if (!exists) {
        list.push({
          id: k.id,
          title: k.title,
          streamUrl: k.streamUrl,
          driveFileId: k.driveFileId,
          posterUrl: k.posterUrl,
          driveEmbedUrl: k.driveEmbedUrl,
          category: k.category,
          location: k.location,
          description: k.description,
          source: "vault",
        });
      }
    });

    return list;
  }, [dbMedia]);

  // Filter reels by search
  const filteredReels = useMemo(() => {
    if (!search.trim()) return allReels;
    const q = search.toLowerCase();
    return allReels.filter(
      (r) =>
        r.title?.toLowerCase().includes(q) ||
        r.category?.toLowerCase().includes(q) ||
        r.location?.toLowerCase().includes(q) ||
        r.fileName?.toLowerCase().includes(q) ||
        r.driveFileId?.toLowerCase().includes(q)
    );
  }, [allReels, search]);

  // Parse pasted Google Drive link
  const parsedPastedId = useMemo(() => {
    return extractDriveFileId(pastedUrl);
  }, [pastedUrl]);

  const handleApplyPastedUrl = () => {
    if (!pastedUrl.trim()) return;

    if (parsedPastedId) {
      const urls = buildDriveVideoUrls(parsedPastedId);
      onSelectReel({
        streamUrl: urls.streamUrl,
        driveFileId: parsedPastedId,
        posterUrl: urls.posterUrl,
        driveEmbedUrl: urls.driveEmbedUrl,
        title: "Selected Google Drive Walkthrough Reel",
      });
      toast.success("Google Drive video reel linked successfully!");
      onOpenChange(false);
      setPastedUrl("");
    } else {
      // Direct video URL (e.g. /videos/... or CDN)
      onSelectReel({
        streamUrl: pastedUrl.trim(),
        title: "Custom Video Reel",
      });
      toast.success("Video URL applied!");
      onOpenChange(false);
      setPastedUrl("");
    }
  };

  // Upload video directly to Google Drive
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/") && !file.name.match(/\.(mp4|mov|webm)$/i)) {
      toast.error("Please upload an MP4, MOV, or WEBM video file.");
      return;
    }

    try {
      setIsUploading(true);
      toast.info(`Uploading ${file.name} to Google Drive Vault...`);
      const result: any = await mediaService.upload(file, {
        category: "Architectural Walkthrough",
        title: file.name.replace(/\.[^/.]+$/, ""),
        visibility: "website",
      });

      const uploadedItem = Array.isArray(result) ? result[0] : result;
      const fileId = uploadedItem?.driveFileId;

      if (fileId) {
        const urls = buildDriveVideoUrls(fileId);
        onSelectReel({
          streamUrl: urls.streamUrl,
          driveFileId: fileId,
          posterUrl: urls.posterUrl,
          driveEmbedUrl: urls.driveEmbedUrl,
          title: uploadedItem.title || file.name,
        });
        toast.success("Video uploaded to Google Drive and selected as active reel!");
        await refetch();
        onOpenChange(false);
      } else {
        toast.success("Video uploaded successfully!");
        await refetch();
      }
    } catch {
      toast.error("Could not upload video. You can also paste the Google Drive link directly.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-5 pb-3 border-b border-border bg-card/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-md bg-accent/15 flex items-center justify-center text-accent">
                <Film className="size-4" />
              </div>
              <div>
                <DialogTitle className="font-display font-light text-xl">
                  Select Reel from Google Drive
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Choose an architectural video reel from your studio Google Drive vault, or paste any Drive link.
                </DialogDescription>
              </div>
            </div>

            <a
              href={GOOGLE_DRIVE_VIDEOS_FOLDER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded border border-border bg-card text-foreground hover:border-accent hover:text-accent transition-colors"
            >
              <HardDrive className="size-3.5 text-accent" />
              <span>Open Drive Folder</span>
              <ExternalLink className="size-3 opacity-60" />
            </a>
          </div>

          {/* Quick Paste Google Drive Link Bar */}
          <div className="mt-3.5 pt-3 border-t border-border/70 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Input
                value={pastedUrl}
                onChange={(e) => setPastedUrl(e.target.value)}
                placeholder="Paste any Google Drive Reel Link or File ID..."
                className="text-xs font-mono h-9 pr-8"
              />
              {parsedPastedId && (
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center text-emerald-500">
                  <CheckCircle2 className="size-4" />
                </span>
              )}
            </div>
            <Button
              type="button"
              onClick={handleApplyPastedUrl}
              disabled={!pastedUrl.trim()}
              className="h-9 px-4 text-xs bg-accent text-accent-foreground hover:bg-accent/90 cursor-pointer font-medium"
            >
              Apply Drive Reel
            </Button>
          </div>

          {parsedPastedId && (
            <div className="flex items-center gap-2 text-[11px] text-emerald-600 font-mono mt-1">
              <Sparkles className="size-3.5" />
              <span>Valid Google Drive File ID detected: {parsedPastedId}</span>
            </div>
          )}
        </DialogHeader>

        {/* Search & Actions Bar */}
        <div className="p-4 py-3 border-b border-border bg-secondary/20 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reels by title, category, or project..."
              className="text-xs pl-8 h-8 bg-card"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/quicktime,video/webm"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="h-8 text-xs gap-1.5 cursor-pointer border-accent/40 bg-accent/10 text-accent hover:bg-accent hover:text-white"
            >
              <UploadCloud className={`size-3.5 ${isUploading ? "animate-spin" : ""}`} />
              <span>{isUploading ? "Uploading..." : "Upload New Reel"}</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
              title="Refresh reels from Google Drive"
            >
              <RotateCcw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Reels Showcase Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {filteredReels.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="size-12 rounded-full bg-accent/10 flex items-center justify-center text-accent mx-auto">
                <Film className="size-6" />
              </div>
              <p className="font-display text-base font-light text-foreground">
                No matching Google Drive reels found
              </p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                You can paste any Google Drive video link in the bar above, or upload a new reel directly to your Drive vault.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {filteredReels.map((reel) => {
                const isSelected =
                  currentStreamUrl &&
                  (currentStreamUrl === reel.streamUrl ||
                    (reel.driveFileId && currentStreamUrl.includes(reel.driveFileId)));

                const isPreviewing = previewingVideoId === reel.id;

                return (
                  <div
                    key={reel.id}
                    className={cn(
                      "group relative rounded-xl border p-3.5 flex flex-col justify-between transition-all bg-card/60 hover:bg-card hover:shadow-md",
                      isSelected
                        ? "border-accent ring-2 ring-accent/30 bg-accent/5"
                        : "border-border hover:border-accent/50"
                    )}
                  >
                    <div>
                      {/* Video Poster / Preview Frame */}
                      <div className="relative aspect-[16/10] rounded-lg overflow-hidden bg-black/60 border border-border/80 mb-3 group-hover:border-accent/40 transition-colors">
                        {isPreviewing ? (
                          <video
                            src={reel.streamUrl}
                            autoPlay
                            controls
                            className="size-full object-cover"
                          />
                        ) : reel.posterUrl ? (
                          <img
                            src={reel.posterUrl}
                            alt={reel.title}
                            className="size-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="size-full flex flex-col items-center justify-center text-muted-foreground">
                            <Film className="size-8 opacity-40 mb-1" />
                            <span className="text-[10px] font-mono">Google Drive Reel</span>
                          </div>
                        )}

                        {/* Top Tag Badges */}
                        <div className="absolute top-2 left-2 flex items-center gap-1">
                          <Badge
                            variant="secondary"
                            className="text-[9px] px-1.5 py-0 font-mono bg-black/70 text-white backdrop-blur-xs border-0"
                          >
                            {reel.source === "database" ? "Drive Vault" : "Curated"}
                          </Badge>
                          {isSelected && (
                            <Badge className="text-[9px] px-1.5 py-0 font-mono bg-emerald-600 text-white border-0 flex items-center gap-1">
                              <Check className="size-2.5" /> Active
                            </Badge>
                          )}
                        </div>

                        {/* Quick Preview Toggle Button */}
                        {!isPreviewing && (
                          <button
                            type="button"
                            onClick={() => setPreviewingVideoId(reel.id)}
                            className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            title="Preview video"
                          >
                            <div className="size-9 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-lg transition-transform hover:scale-110">
                              <Play className="size-4 ml-0.5" />
                            </div>
                          </button>
                        )}
                      </div>

                      {/* Video Details */}
                      <h4 className="font-display font-medium text-xs sm:text-sm text-foreground line-clamp-2 leading-snug">
                        {reel.title}
                      </h4>

                      <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
                        {reel.category && <span>{reel.category}</span>}
                        {reel.location && (
                          <>
                            <span>·</span>
                            <span>{reel.location}</span>
                          </>
                        )}
                      </div>

                      {reel.driveFileId && (
                        <p className="mt-1.5 text-[9px] font-mono text-accent/80 truncate">
                          ID: {reel.driveFileId}
                        </p>
                      )}
                    </div>

                    {/* Bottom Action Button */}
                    <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          const resolvedStream = resolveVideoStreamUrl(reel.driveFileId, reel.streamUrl);
                          onSelectReel({
                            streamUrl: resolvedStream,
                            driveFileId: reel.driveFileId,
                            title: reel.title,
                            posterUrl: reel.posterUrl,
                            driveEmbedUrl: reel.driveEmbedUrl,
                            category: reel.category,
                            location: reel.location,
                            description: reel.description,
                          });
                          toast.success(`Selected reel: "${reel.title}"`);
                          onOpenChange(false);
                        }}
                        className={cn(
                          "w-full h-8 text-xs font-medium cursor-pointer transition-all",
                          isSelected
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : "bg-accent text-accent-foreground hover:bg-accent/90"
                        )}
                      >
                        {isSelected ? "Current Active Reel" : "Use This Reel"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter className="p-4 border-t border-border bg-card/60 flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground">
            Any video in your Google Drive can be selected or linked directly as your studio walkthrough reel.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer text-xs"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
