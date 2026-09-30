import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { listJournal } from "@/lib/public.functions";
import { PublicShell, PageHeader } from "@/components/site/PublicShell";
import { GOOGLE_DRIVE_PHOTOS } from "@/lib/google-drive-photos";
import { DriveImage } from "@/components/site/DriveImage";

const journalQuery = queryOptions({ queryKey: ["journal"], queryFn: () => listJournal() });

export const Route = createFileRoute("/journal/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(journalQuery),
  component: Journal,
  head: () => ({
    meta: [
      { title: "Journal — Interior Design Notes | Atelier Vermilion" },
      {
        name: "description",
        content:
          "Essays on materials, daylight planning, joinery and the economics of premium interiors, written by the Atelier Vermilion studio.",
      },
      { property: "og:title", content: "Journal — Atelier Vermilion" },
      {
        property: "og:description",
        content: "Notes on materials, process and craft from the studio.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  errorComponent: () => (
    <PublicShell>
      <PageHeader eyebrow="Journal" title="We couldn't load the journal" />
    </PublicShell>
  ),
});

function Journal() {
  const { data: posts } = useSuspenseQuery(journalQuery);
  return (
    <PublicShell>
      <PageHeader
        eyebrow="Journal"
        title="Notes from the studio."
        intro="What we have learned specifying, drawing and building interiors — written for the people who commission them."
      />
      <section className="mx-auto max-w-[1400px] px-5 py-16 pb-24 sm:px-8">
        <div className="grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <Link key={p.slug} to="/journal/$slug" params={{ slug: p.slug }} className="group">
              <div className="aspect-[3/2] w-full overflow-hidden bg-secondary/30">
                <DriveImage
                  src={p.cover_image || GOOGLE_DRIVE_PHOTOS[1]?.url}
                  alt={p.title}
                  className="arch-card-img size-full object-cover"
                  wrapperClassName="size-full"
                />
              </div>
              <p className="eyebrow mt-4">
                {p.category} · {p.read_minutes} min read
              </p>
              <h2 className="mt-2 font-display text-2xl font-light group-hover:text-accent transition-colors">{p.title}</h2>

              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.excerpt}</p>
            </Link>
          ))}
        </div>
      </section>
    </PublicShell>
  );
}
