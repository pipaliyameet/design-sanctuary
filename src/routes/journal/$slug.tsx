import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getJournalPost } from "@/lib/public.functions";
import { PublicShell, PageHeader } from "@/components/site/PublicShell";

const postQuery = (slug: string) =>
  queryOptions({ queryKey: ["journal", slug], queryFn: () => getJournalPost({ data: { slug } }) });

export const Route = createFileRoute("/journal/$slug")({
  loader: async ({ context, params }) => {
    const post = await context.queryClient.ensureQueryData(postQuery(params.slug));
    if (!post) throw notFound();
    return post;
  },
  component: Post,
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const title = `${loaderData.title} — Atelier Vermilion Journal`;
    const description = loaderData.excerpt ?? "Notes from the Atelier Vermilion studio.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: () => (
    <PublicShell>
      <PageHeader eyebrow="Journal" title="That article isn't published" />
    </PublicShell>
  ),
  errorComponent: () => (
    <PublicShell>
      <PageHeader eyebrow="Journal" title="We couldn't load this article" />
    </PublicShell>
  ),
});

function Post() {
  const { slug } = Route.useParams();
  const { data: post } = useSuspenseQuery(postQuery(slug));
  if (!post) return null;

  return (
    <PublicShell>
      <article className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
        <p className="eyebrow">
          {post.category} · {post.read_minutes} min read
        </p>
        <h1 className="mt-5 text-4xl leading-[1.06] sm:text-5xl">{post.title}</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          {post.author}
          {post.published_at ? ` · ${new Date(post.published_at).toLocaleDateString()}` : ""}
        </p>
        <img
          src={post.cover_image ?? "/portfolio/p2.jpg"}
          alt={post.title}
          className="mt-10 aspect-[16/9] w-full object-cover"
        />
        <div className="mt-10 space-y-6 text-base leading-relaxed text-muted-foreground">
          {(post.body ?? post.excerpt ?? "").split("\n\n").map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
        <Link to="/journal" className="mt-14 inline-block text-sm text-accent hover:underline">
          All journal entries
        </Link>
      </article>
    </PublicShell>
  );
}
