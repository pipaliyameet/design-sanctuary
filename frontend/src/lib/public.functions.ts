import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createPublicSupabase } from "./supabase-public";

type SettingValue = Record<string, string | number | boolean | null>;

const CASE_CARD =
  "slug, title, subtitle, location, year, hero_image, summary, space_type, style, area_sqft, featured, published_at";

export type CaseCard = {
  slug: string;
  title: string;
  subtitle: string | null;
  location: string | null;
  year: number | null;
  hero_image: string | null;
  summary: string | null;
  space_type: string | null;
  style: string | null;
  area_sqft: number | null;
  featured: boolean;
  published_at: string | null;
};

export const listCaseStudies = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createPublicSupabase();
  const { data, error } = await supabase
    .from("case_studies")
    .select(CASE_CARD)
    .eq("published", true)
    .order("featured", { ascending: false })
    .order("published_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as CaseCard[];
});

export const getCaseStudy = createServerFn({ method: "GET" })
  .validator((input: { slug: string }) => z.object({ slug: z.string().min(1) }).parse(input))
  .handler(async ({ data: input }) => {
    const supabase = createPublicSupabase();
    const { data, error } = await supabase
      .from("case_studies")
      .select(
        "slug, title, subtitle, location, year, hero_image, summary, brief, solution, materials, gallery, credits, space_type, style, area_sqft, published_at, seo_title, seo_description",
      )
      .eq("published", true)
      .eq("slug", input.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;

    const { data: related } = await supabase
      .from("case_studies")
      .select(CASE_CARD)
      .eq("published", true)
      .neq("slug", input.slug)
      .limit(3);

    return { study: data, related: (related ?? []) as CaseCard[] };
  });

export const listJournal = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createPublicSupabase();
  const { data, error } = await supabase
    .from("journal_posts")
    .select("slug, title, excerpt, cover_image, category, author, read_minutes, published_at")
    .eq("published", true)
    .order("published_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getJournalPost = createServerFn({ method: "GET" })
  .validator((input: { slug: string }) => z.object({ slug: z.string().min(1) }).parse(input))
  .handler(async ({ data: input }) => {
    const supabase = createPublicSupabase();
    const { data, error } = await supabase
      .from("journal_posts")
      .select("slug, title, excerpt, body, cover_image, category, author, read_minutes, published_at")
      .eq("published", true)
      .eq("slug", input.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });

export const getSiteSettings = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createPublicSupabase();
  const { data, error } = await supabase.from("site_settings").select("key, value");
  if (error) throw new Error(error.message);
  const map: Record<string, SettingValue> = {};
  for (const row of data ?? []) map[row.key] = (row.value ?? {}) as SettingValue;
  return map;
});

export const getHomeContent = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createPublicSupabase();
  const [studies, posts, settings] = await Promise.all([
    supabase
      .from("case_studies")
      .select(CASE_CARD)
      .eq("published", true)
      .order("featured", { ascending: false })
      .order("published_at", { ascending: false })
      .limit(7),
    supabase
      .from("journal_posts")
      .select("slug, title, excerpt, cover_image, category, read_minutes, published_at")
      .eq("published", true)
      .order("published_at", { ascending: false })
      .limit(3),
    supabase.from("site_settings").select("key, value"),
  ]);

  const settingsMap: Record<string, SettingValue> = {};
  for (const row of settings.data ?? [])
    settingsMap[row.key] = (row.value ?? {}) as SettingValue;

  return {
    studies: (studies.data ?? []) as CaseCard[],
    posts: posts.data ?? [],
    settings: settingsMap,
  };
});

const enquirySchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  space_type: z.string().trim().max(80).optional().or(z.literal("")),
  budget_band: z.string().trim().max(80).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
});

export const submitEnquiry = createServerFn({ method: "POST" })
  .validator((input: unknown) => enquirySchema.parse(input))
  .handler(async ({ data: input }) => {
    const supabase = createPublicSupabase();
    const { error } = await supabase.from("enquiries").insert({
      name: input.name,
      email: input.email,
      phone: input.phone || null,
      city: input.city || null,
      space_type: input.space_type || null,
      budget_band: input.budget_band || null,
      message: input.message || null,
      source: "website",
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
