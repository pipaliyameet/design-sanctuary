import { ArrowUpRight, Instagram } from "lucide-react";
import { STUDIO_DETAILS } from "@/lib/public.functions";
import { GOOGLE_DRIVE_PHOTOS } from "@/lib/google-drive-photos";
import { DriveImage } from "./DriveImage";

const SOCIAL_PHOTOS = [
  {
    url: GOOGLE_DRIVE_PHOTOS[14]?.url || "https://lh3.googleusercontent.com/d/1U423Hk6l3rD46m53ZgC235fS8Jk_n8xO",
    caption: "Sunlit travertine shadow study. The Altamount Penthouse.",
  },
  {
    url: GOOGLE_DRIVE_PHOTOS[15]?.url || "https://lh3.googleusercontent.com/d/102c7uJbW2w0QoYy_Jp21q8R_ZgZ17_0_",
    caption: "Water courtyard reflections at golden hour. Alibaug Villa.",
  },
  {
    url: GOOGLE_DRIVE_PHOTOS[16]?.url || "https://lh3.googleusercontent.com/d/1A-4-Y0g2t187P33YwDqL5n35Q1xK3r8G",
    caption: "Solid oak joinery prototype and unlacquered brass shadow lines.",
  },
  {
    url: GOOGLE_DRIVE_PHOTOS[17]?.url || "https://lh3.googleusercontent.com/d/18r_u2G04m2K3812W56_J9p21q8R_ZgZ1",
    caption: "Curved microcement master niche overlooking canopy.",
  },
  {
    url: GOOGLE_DRIVE_PHOTOS[18]?.url || "https://lh3.googleusercontent.com/d/1eL3_n8X0pQ23456_J9p21q8R_ZgZ17_0",
    caption: "Bookmatched Italian marble and patinated bronze details.",
  },
  {
    url: GOOGLE_DRIVE_PHOTOS[19]?.url || "https://lh3.googleusercontent.com/d/1fG2_m9Y1qR34567_K0q32r9S_AhA28_1",
    caption: "Teak verandah colonnade capturing sea breeze.",
  },
];


export function InstagramFeedSection() {
  return (
    <section className="border-t border-border bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 pb-10 border-b border-border">
          <div>
            <p className="eyebrow flex items-center gap-2">
              <Instagram className="size-3 text-accent" /> STUDIO JOURNAL
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
          {SOCIAL_PHOTOS.map((item, idx) => (
            <a
              key={idx}
              href={STUDIO_DETAILS.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden bg-secondary/30 border border-border/60"
            >
              <DriveImage
                src={item.url}
                alt={item.caption}
                className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                wrapperClassName="size-full"
              />
              <div className="absolute inset-0 bg-ink/75 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end p-3">
                <p className="text-[11px] text-ink-foreground line-clamp-3 leading-snug font-light">
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

