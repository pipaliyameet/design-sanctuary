import { ArrowUpRight, Instagram, Image as ImageIcon } from "lucide-react";
import { STUDIO_DETAILS, getHomepageMedia } from "@/lib/public.functions";
import { useQuery } from "@tanstack/react-query";
import { DriveImage } from "./DriveImage";

interface InstagramFeedSectionProps {
  photos?: Array<{
    url: string;
    caption?: string;
    title?: string;
    thumbnailUrl?: string;
    thumbnail_url?: string;
  }>;
}

export function InstagramFeedSection({ photos: propPhotos }: InstagramFeedSectionProps) {
  const { data: fetchedPhotos } = useQuery({
    queryKey: ["homepage-media"],
    queryFn: () => getHomepageMedia(),
    enabled: !propPhotos,
    staleTime: 1000 * 60 * 2,
  });

  const displayPhotos = propPhotos || fetchedPhotos || [];

  if (displayPhotos.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-border bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 pb-10 border-b border-border">
          <div>
            <p className="eyebrow flex items-center gap-2">
              <Instagram className="size-3 text-accent" /> STUDIO DISPATCH
            </p>
            <h2 className="mt-2 text-2xl sm:text-4xl font-display font-light text-foreground">
              Material Studies & Site Dispatch
            </h2>
          </div>
          <a
            href={STUDIO_DETAILS.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-accent hover:underline font-medium"
          >
            Follow the studio on Instagram <ArrowUpRight className="size-3.5" />
          </a>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {displayPhotos.slice(0, 6).map((item, idx) => (
            <a
              key={idx}
              href={STUDIO_DETAILS.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden bg-secondary/30 border border-border/60"
            >
              <DriveImage
                src={item.url}
                fallbackUrls={[item.thumbnail_url, item.thumbnailUrl].filter(Boolean) as string[]}
                alt={item.caption || item.title || "Studio Dispatch"}
                className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                wrapperClassName="size-full"
              />
              <div className="absolute inset-0 bg-ink/75 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end p-3">
                <p className="text-[11px] text-ink-foreground line-clamp-3 leading-snug font-light">
                  {item.caption || item.title || "Right Angle Design Studio"}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
