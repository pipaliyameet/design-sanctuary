import { ArrowUpRight, Instagram } from "lucide-react";
import { STUDIO_DETAILS } from "@/lib/public.functions";

const SOCIAL_PHOTOS = [
  {
    url: "/portfolio/hero.jpg",
    caption: "Sunlit travertine shadow study. The Shah Residence.",
  },
  {
    url: "/portfolio/p1.jpg",
    caption: "Water courtyard reflections at golden hour.",
  },
  {
    url: "/portfolio/p6.jpg",
    caption: "Solid oak joinery prototype and unlacquered brass shadow lines.",
  },
  {
    url: "/portfolio/p2.jpg",
    caption: "Curved microcement volumes overlooking Bengaluru canopy.",
  },
  {
    url: "/portfolio/p4.jpg",
    caption: "Restored 1930s Art Deco terrazzo drawing room.",
  },
  {
    url: "/portfolio/p5.jpg",
    caption: "Teak verandah colannade capturing Alibaug sea breeze.",
  },
];

export function InstagramFeedSection() {
  return (
    <section className="border-t border-border/70 bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 pb-10">
          <div>
            <p className="eyebrow flex items-center gap-2">
              <Instagram className="size-3.5 text-accent" /> Visual Journal & Studio Life
            </p>
            <h2 className="mt-3 text-2xl sm:text-4xl font-display text-foreground">
              From the drawing board & site walks.
            </h2>
          </div>
          <a
            href={STUDIO_DETAILS.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-accent hover:underline font-medium"
          >
            Follow our studio on Instagram <ArrowUpRight className="size-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {SOCIAL_PHOTOS.map((item, idx) => (
            <a
              key={idx}
              href={STUDIO_DETAILS.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden bg-secondary/30"
            >
              <img
                src={item.url}
                alt={item.caption}
                loading="lazy"
                className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-ink/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end p-3">
                <p className="text-[11px] text-ink-foreground line-clamp-2 leading-snug">
                  {item.caption}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
