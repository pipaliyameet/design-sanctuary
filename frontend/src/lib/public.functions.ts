import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createPublicSupabase } from "./supabase-public";

type SettingValue = Record<string, string | number | boolean | null>;

export type RoomGalleryItem = {
  room: string;
  title: string;
  description: string;
  images: Array<{
    url: string;
    caption: string;
    alt: string;
  }>;
};

export type BeforeAfterPair = {
  beforeUrl: string;
  afterUrl: string;
  beforeLabel?: string;
  afterLabel?: string;
  caption: string;
};

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
  tags?: string[];
};

export type FullCaseStudy = CaseCard & {
  brief: string | null;
  solution: string | null;
  materials: string[];
  scope: string[];
  timeline: string;
  rooms: RoomGalleryItem[];
  before_after: BeforeAfterPair | null;
  credits: Record<string, string>;
  gallery: Array<{ url: string; caption: string }>;
  seo_title?: string | null;
  seo_description?: string | null;
};

export type JournalPost = {
  slug: string;
  title: string;
  excerpt: string;
  body?: string;
  cover_image: string | null;
  category: string;
  author: string;
  read_minutes: number;
  published_at: string | null;
};

/* ----------------------------- Fallback Data ----------------------------- */

export const FALLBACK_CASE_STUDIES: FullCaseStudy[] = [
  {
    slug: "shah-residence-ahmedabad",
    title: "The Shah Residence",
    subtitle: "Courtyard Villa & Private Sanctum",
    location: "Ahmedabad, Gujarat",
    year: 2026,
    hero_image: "/portfolio/hero.jpg",
    summary:
      "A 6,400 sq ft monolithic brick and honed travertine residence arranged around a reflective water court. Filtered desert daylight, fumed oak joinery, and antique brass details.",
    brief:
      "The client requested a multi-generational home that shut out the dense urban noise of western Ahmedabad while opening entirely inward to light, breeze, and courtyards.",
    solution:
      "We conceived the plan around a central travertine water court. Deep overhangs temper the midday sun, while bespoke brass jalis filter light into private family lounges. Every joinery junction was documented down to 2mm shadow lines before fabrication.",
    space_type: "Residential",
    style: "Architectural Minimalist",
    area_sqft: 6400,
    featured: true,
    published_at: "2026-03-01T00:00:00Z",
    tags: ["Residential", "Villa", "Courtyard", "Travertine"],
    materials: [
      "Honed Roman Travertine",
      "Fumed European White Oak",
      "Hand-trowelled Lime Plaster",
      "Brushed Antique Brass",
      "Raw Belgian Linen",
    ],
    scope: [
      "Interior Architecture",
      "Custom Millwork & Joinery",
      "Architectural Lighting Design",
      "Furniture Curation & Bespoke Fabrication",
      "Turnkey Site Management",
    ],
    timeline: "14 months (Concept to Handover)",
    credits: {
      "Principal Designer": "Ira Kapoor",
      "Project Director": "Nikhil Menon",
      "Lighting Consultant": "Lumina Atelier",
      Photography: "Studio Anay / Ashish Sahi",
    },
    before_after: {
      beforeUrl: "/portfolio/p8.jpg",
      afterUrl: "/portfolio/hero.jpg",
      beforeLabel: "Bare Concrete Shell",
      afterLabel: "Finished Living Sanctuary",
      caption: "Living Pavilion transformation from raw slab to finished travertine sanctuary.",
    },
    rooms: [
      {
        room: "Living & Reception",
        title: "The Double-Height Sunlit Pavilion",
        description:
          "Anchored by floor-to-ceiling honed travertine slabs and bespoke low-slung linen sofas designed exclusively for the family.",
        images: [
          {
            url: "/portfolio/hero.jpg",
            caption: "Sunlit living pavilion with custom oak millwork and unlacquered brass accents.",
            alt: "Living room with travertine floor and brass accents",
          },
          {
            url: "/portfolio/p1.jpg",
            caption: "Detail of the sunken conversational lounge opening onto the stone water court.",
            alt: "Sunken lounge area",
          },
        ],
      },
      {
        room: "Kitchen & Dining",
        title: "Monolithic Quartzite & Smoked Timber",
        description:
          "Concealed pocket doors hide utility zones, leaving an unbroken 4.2-meter kitchen island in leathered quartzite.",
        images: [
          {
            url: "/portfolio/p3.jpg",
            caption: "Minimalist dining room with bespoke dining table carved from solid smoked oak.",
            alt: "Dining room with smoked oak table",
          },
          {
            url: "/portfolio/p7.jpg",
            caption: "Sculptural kitchen island with integrated induction cooking and brass tapware.",
            alt: "Kitchen island with brass fixtures",
          },
        ],
      },
      {
        room: "Master Sanctuary",
        title: "Private Courtyard Suite",
        description:
          "Tactile lime plaster walls and fluted glass partitions creating a sanctuary of quiet acoustic comfort.",
        images: [
          {
            url: "/portfolio/p4.jpg",
            caption: "Master bedroom suite looking out onto the morning terrace garden.",
            alt: "Master bedroom with terrace garden view",
          },
          {
            url: "/portfolio/p6.jpg",
            caption: "Bespoke walk-in dressing room with fumed oak wardrobes and diffused cove lighting.",
            alt: "Walk-in dressing room with warm lighting",
          },
        ],
      },
    ],
    gallery: [
      { url: "/portfolio/hero.jpg", caption: "Main living salon" },
      { url: "/portfolio/p1.jpg", caption: "Courtyard transition" },
      { url: "/portfolio/p3.jpg", caption: "Dining pavilion" },
      { url: "/portfolio/p4.jpg", caption: "Master suite" },
      { url: "/portfolio/p6.jpg", caption: "Joinery detail" },
      { url: "/portfolio/p7.jpg", caption: "Kitchen detail" },
    ],
    seo_title: "The Shah Residence — Luxury Interior Design Ahmedabad | Atelier Vermilion",
    seo_description:
      "Explore The Shah Residence in Ahmedabad: a 6,400 sq ft architectural residence detailed in travertine, fumed oak, and antique brass by Atelier Vermilion.",
  },
  {
    slug: "alibaug-coastal-villa",
    title: "Alibaug Coastal Villa",
    subtitle: "Tropical Modernist Retreat",
    location: "Alibaug, Maharashtra",
    year: 2025,
    hero_image: "/portfolio/p5.jpg",
    summary:
      "A seamless indoor-outdoor coastal refuge crafted from local basalt stone, teak wood, and hand-plastered walls embracing maritime breezes.",
    brief:
      "A family weekend home built to age gracefully against maritime salt and humidity, balancing rustic coastal honesty with refined luxury.",
    solution:
      "We utilised weathered basalt floors, reclaimed Burma teak timber, and deep colonnades. Large pocketing glass walls disappear completely, transforming living spaces into breezy open pavilions.",
    space_type: "Residential",
    style: "Coastal Modernism",
    area_sqft: 9200,
    featured: true,
    published_at: "2025-11-15T00:00:00Z",
    tags: ["Residential", "Villa", "Coastal", "Architecture"],
    materials: [
      "Local Hand-Chiseled Basalt",
      "Reclaimed Burma Teak",
      "Terracotta Floor Tiles",
      "Muted Woven Rattan",
      "Off-White Clay Plaster",
    ],
    scope: [
      "Full Interior Architecture",
      "Outdoor Pavilion & Landscape Integration",
      "Custom Teak Furniture",
      "Turnkey Execution",
    ],
    timeline: "18 months",
    credits: {
      "Lead Designer": "Devanshi Rao",
      "Principal Architect": "Ira Kapoor",
      Photography: "Studio Anay",
    },
    before_after: {
      beforeUrl: "/portfolio/p8.jpg",
      afterUrl: "/portfolio/p5.jpg",
      beforeLabel: "Site Excavation",
      afterLabel: "Verandah Pavilion",
      caption: "Transition from raw site grading to open-air teak verandah.",
    },
    rooms: [
      {
        room: "Verandah & Living",
        title: "The Colonnaded Hall",
        description:
          "Open to coastal breezes on three sides, floored in river-washed stone and shaded by deep timber eaves.",
        images: [
          {
            url: "/portfolio/p5.jpg",
            caption: "Open verandah lounge framing the private pool and coconut palms.",
            alt: "Verandah lounge with ocean breeze",
          },
          {
            url: "/portfolio/p2.jpg",
            caption: "Living room detailed with low teak benches and handwoven wool rugs.",
            alt: "Living room with teak furniture",
          },
        ],
      },
      {
        room: "Dining & Bar",
        title: "The Garden Table",
        description:
          "A single 14-seater monolithic teak dining slab overlooking the tropical courtyard.",
        images: [
          {
            url: "/portfolio/p3.jpg",
            caption: "Dining area connected to the open culinary kitchen.",
            alt: "Open dining area overlooking courtyard",
          },
        ],
      },
    ],
    gallery: [
      { url: "/portfolio/p5.jpg", caption: "Verandah view" },
      { url: "/portfolio/p2.jpg", caption: "Indoor lounge" },
      { url: "/portfolio/p3.jpg", caption: "Dining loggia" },
      { url: "/portfolio/p7.jpg", caption: "Kitchen bar" },
    ],
    seo_title: "Alibaug Coastal Villa — Architecture & Interiors | Atelier Vermilion",
    seo_description:
      "A 9,200 sq ft tropical modernist villa in Alibaug detailed in basalt, reclaimed teak, and clay plaster by Atelier Vermilion.",
  },
  {
    slug: "koramangala-minimalist-penthouse",
    title: "Koramangala Sky Penthouse",
    subtitle: "High-Rise Serenity & Monoliths",
    location: "Bengaluru, Karnataka",
    year: 2026,
    hero_image: "/portfolio/p2.jpg",
    summary:
      "An ethereal top-floor residence elevated above the canopy of Bengaluru, defined by sweeping curves, seamless micro-cement, and walnut panelling.",
    brief:
      "Transform an empty 4,800 sq ft developer penthouse into an acoustically silent, museum-grade living environment for a tech founder and art collector.",
    solution:
      "We stripped the partitions to create continuous spatial flow. Micro-cement seamless floors reflect soft natural light, while integrated art niches with 3000K museum-spec lighting frame contemporary Indian art.",
    space_type: "Residential",
    style: "Warm Contemporary Minimalist",
    area_sqft: 4800,
    featured: true,
    published_at: "2026-02-10T00:00:00Z",
    tags: ["Residential", "Penthouse", "Minimalist"],
    materials: [
      "Seamless Warm-Grey Microcement",
      "American Walnut Millwork",
      "Calacatta Viola Marble",
      "Concealed Architectural Lighting",
    ],
    scope: [
      "Spatial Layout Re-engineering",
      "Art Gallery Lighting",
      "Modular Acoustic Ceilings",
      "Bespoke Furniture Manufacturing",
    ],
    timeline: "11 months",
    credits: {
      "Design Director": "Devanshi Rao",
      "Project Lead": "Nikhil Menon",
      Photography: "Ashish Sahi",
    },
    before_after: {
      beforeUrl: "/portfolio/p8.jpg",
      afterUrl: "/portfolio/p2.jpg",
      beforeLabel: "Standard Developer Shell",
      afterLabel: "Sculptural Living Gallery",
      caption: "Replaced cluttered partition walls with sweeping curved volumes and micro-cement.",
    },
    rooms: [
      {
        room: "Living Gallery",
        title: "The Sky Salon",
        description:
          "Panoramic skyline glazing tempered by floor-to-ceiling linen sheers and walnut acoustic panelling.",
        images: [
          {
            url: "/portfolio/p2.jpg",
            caption: "Sculptural fireplace wall and low-profile modular seating.",
            alt: "Living gallery with skyline view",
          },
          {
            url: "/portfolio/p6.jpg",
            caption: "Architectural shadow gap detail along walnut panelling.",
            alt: "Shadow gap joinery detail",
          },
        ],
      },
    ],
    gallery: [
      { url: "/portfolio/p2.jpg", caption: "Sky salon" },
      { url: "/portfolio/p6.jpg", caption: "Walnut panel detail" },
      { url: "/portfolio/p1.jpg", caption: "Lounge area" },
    ],
    seo_title: "Koramangala Sky Penthouse — Minimalist Interior Design Bengaluru",
    seo_description:
      "A 4,800 sq ft minimalist luxury penthouse in Koramangala Bengaluru detailed by Atelier Vermilion.",
  },
  {
    slug: "bandra-heritage-loft",
    title: "Bandra Heritage Apartment",
    subtitle: "Restoration & Quiet Decadence",
    location: "Mumbai, Maharashtra",
    year: 2025,
    hero_image: "/portfolio/p4.jpg",
    summary:
      "A sensitive restoration of an Art Deco apartment in Bandra, marrying restored terrazzo floors with dark walnut cabinetry and patinated bronze.",
    brief:
      "Restore the soul of an authentic 1938 Art Deco residence while upgrading plumbing, electrical, and insulation to contemporary luxury standards.",
    solution:
      "We preserved the original cast-in-place terrazzo patterns and teak window casings, adding dark fluted walnut joinery and custom brass handles cast in local foundries.",
    space_type: "Residential",
    style: "Heritage & Art Deco",
    area_sqft: 3200,
    featured: false,
    published_at: "2025-08-14T00:00:00Z",
    tags: ["Residential", "Heritage", "Renovation"],
    materials: [
      "Restored Heritage Terrazzo",
      "Solid Indian Rosewood",
      "Aged Cast Bronze",
      "Fluted Reeded Glass",
    ],
    scope: ["Heritage Conservation", "Joinery Detailing", "Turnkey Interior Fitout"],
    timeline: "9 months",
    credits: {
      "Principal Designer": "Ira Kapoor",
      Photography: "Studio Anay",
    },
    before_after: {
      beforeUrl: "/portfolio/p8.jpg",
      afterUrl: "/portfolio/p4.jpg",
      beforeLabel: "Dilapidated 1930s Interior",
      afterLabel: "Restored Deco Residence",
      caption: "Careful masonry restoration and authentic lime-wash finish.",
    },
    rooms: [
      {
        room: "Drawing Room",
        title: "The Deco Salon",
        description: "Restored coved ceilings and custom rosewood credenzas.",
        images: [
          {
            url: "/portfolio/p4.jpg",
            caption: "Drawing room with curated vintage lighting and original terrazzo.",
            alt: "Art Deco drawing room",
          },
        ],
      },
    ],
    gallery: [
      { url: "/portfolio/p4.jpg", caption: "Drawing room" },
      { url: "/portfolio/p7.jpg", caption: "Pantry detail" },
    ],
    seo_title: "Bandra Heritage Apartment — Art Deco Interior Renovation Mumbai",
    seo_description:
      "3,200 sq ft Art Deco heritage apartment restoration in Bandra Mumbai by Atelier Vermilion.",
  },
  {
    slug: "ochre-stone-studio-workspace",
    title: "Ochre & Stone Studio Workspace",
    subtitle: "Biophilic Executive Headquarters",
    location: "Lower Parel, Mumbai",
    year: 2025,
    hero_image: "/portfolio/p7.jpg",
    summary:
      "An executive headquarters designed with residential warmth: clay plaster, acoustic wool partitions, and bespoke collaborative worktables.",
    brief:
      "Create a workplace that feels like a calm residential library, fostering deep thinking and high-trust client hospitality.",
    solution:
      "We eliminated fluorescent grids and cubicles in favor of warm 2700K indirect cove lighting, lime-washed acoustic baffles, and private library pods.",
    space_type: "Office",
    style: "Workplace & Commercial",
    area_sqft: 5500,
    featured: false,
    published_at: "2025-06-20T00:00:00Z",
    tags: ["Office", "Commercial", "Workplace"],
    materials: [
      "Acoustic Wool Felt",
      "Limewashed Birch Plywood",
      "Leathered Granite",
      "Low-Iron Acoustic Glazing",
    ],
    scope: ["Commercial Interior Architecture", "MEP Engineering", "Turnkey Execution"],
    timeline: "6 months",
    credits: {
      "Design Lead": "Sara Qureshi",
      "Project Director": "Nikhil Menon",
      Photography: "Ashish Sahi",
    },
    before_after: null,
    rooms: [
      {
        room: "Executive Boardroom",
        title: "The Quiet Room",
        description: "Acoustically isolated conference table carved from solid granite.",
        images: [
          {
            url: "/portfolio/p7.jpg",
            caption: "Boardroom and collaborative breakout zone.",
            alt: "Executive workspace interior",
          },
        ],
      },
    ],
    gallery: [
      { url: "/portfolio/p7.jpg", caption: "Boardroom" },
      { url: "/portfolio/p3.jpg", caption: "Library lounge" },
    ],
    seo_title: "Ochre & Stone Headquarters — Commercial Interior Design Mumbai",
    seo_description:
      "Executive commercial workspace and studio interiors in Lower Parel Mumbai by Atelier Vermilion.",
  },
  {
    slug: "the-verandah-cafe-dining",
    title: "The Verandah Dining & Lounge",
    subtitle: "Boutique Hospitality & Bar",
    location: "Fort, Mumbai",
    year: 2025,
    hero_image: "/portfolio/p3.jpg",
    summary:
      "A moody, intimate 80-cover restaurant and cocktail lounge crafted with fluted dark marble, oxidized copper, and ambient amber lighting.",
    brief:
      "Craft an experiential dining atmosphere that pays homage to old Bombay's maritime history with contemporary material tactility.",
    solution:
      "Custom curved banquettes in deep olive velvet, a cast-bronze cocktail bar, and targeted pin-spot illumination highlighting the culinary experience.",
    space_type: "Hospitality",
    style: "Hospitality & Dining",
    area_sqft: 2800,
    featured: false,
    published_at: "2025-04-12T00:00:00Z",
    tags: ["Hospitality", "Restaurant", "Bar"],
    materials: [
      "Verde Guatemala Marble",
      "Oxidized Copper Mesh",
      "Olive Velvet Upholstery",
      "Smoked Fluted Glass",
    ],
    scope: ["Hospitality Interior Design", "Commercial Kitchen Coordination", "Bespoke Lighting"],
    timeline: "7 months",
    credits: {
      "Lead Designer": "Ira Kapoor",
      Photography: "Studio Anay",
    },
    before_after: null,
    rooms: [
      {
        room: "Main Dining Hall",
        title: "The Emerald Bar & Dining",
        description: "Intimate seating bays with acoustic sound dampening.",
        images: [
          {
            url: "/portfolio/p3.jpg",
            caption: "Dining booths and bar counter.",
            alt: "Moody dining and cocktail lounge",
          },
        ],
      },
    ],
    gallery: [
      { url: "/portfolio/p3.jpg", caption: "Main dining" },
      { url: "/portfolio/p1.jpg", caption: "Bar detail" },
    ],
    seo_title: "The Verandah Dining — Hospitality Interior Design | Atelier Vermilion",
    seo_description:
      "Boutique hospitality and dining space designed by Atelier Vermilion in Fort Mumbai.",
  },
];

export const FALLBACK_JOURNAL_POSTS: JournalPost[] = [
  {
    slug: "material-honesty",
    title: "On Material Honesty: Five Finishes and No Disguises",
    excerpt:
      "Why we restrict every scheme to three foundational materials before introducing accents — and why restraint is the hardest discipline in luxury interiors.",
    body: `Restraint is not austerity. When a project settles on five materials instead of fifteen, every junction has to be resolved rather than disguised.\n\nWe start every scheme with a stone, a timber and a metal. Everything else answers to them. If a detail cannot be resolved cleanly without a plastic trim or an unnecessary cornice, the design is reconsidered.\n\nTrue luxury does not shout with gilded mouldings; it speaks through the weight of a solid brass door lever, the cool touch of honed travertine under bare feet, and the way afternoon daylight rakes across hand-trowelled lime plaster.`,
    cover_image: "/portfolio/p6.jpg",
    category: "Philosophy & Materials",
    author: "Ira Kapoor",
    read_minutes: 6,
    published_at: "2026-02-28T00:00:00Z",
  },
  {
    slug: "light-first-planning",
    title: "Light-First Planning: Charting the Sun Before Furniture Appears",
    excerpt:
      "How full-year solar daylight simulations dictate the flow of spaces before a single partition or sofa is drafted.",
    body: `Before we draw a single furniture plan, we map the sun across the site through the solstices. Living and social zones require the long, amber glow of western afternoons, while bedrooms and meditation spaces require the gentle clarity of morning east light.\n\nBy positioning openings, deep reveals, and timber louvres around sun vectors, spaces feel naturally luminous without the constant demand for artificial fixtures.`,
    cover_image: "/portfolio/hero.jpg",
    category: "Architectural Process",
    author: "Devanshi Rao",
    read_minutes: 5,
    published_at: "2026-02-14T00:00:00Z",
  },
  {
    slug: "joinery-that-lasts",
    title: "Joinery That Lasts a Decade: Shadow Gaps, Hardware & Tolerances",
    excerpt:
      "The hidden specifications that decide whether millwork continues to glide effortlessly after five monsoons.",
    body: `Millwork fails at the edges. In coastal and tropical climates, seasonal humidity causes timber and veneer to breathe. We specify minimum 2mm solid wood lippings, European concealed clip-top hinges, and a 3mm architectural shadow gap that forgives settling plaster.\n\nEvery wardrobe, vanity, and credenza is engineered as a shop drawing in our studio before workshop manufacturing begins.`,
    cover_image: "/portfolio/p2.jpg",
    category: "Craft & Detailing",
    author: "Nikhil Menon",
    read_minutes: 7,
    published_at: "2026-01-20T00:00:00Z",
  },
  {
    slug: "living-with-stone",
    title: "Living With Stone: The Tactile Grace of Honed Travertine",
    excerpt:
      "Why polished marble looks commercial, while honed travertine gains a soft, historic patina that records the life of a home.",
    body: `Stone is not an inert surface; it is a geologic history. High-gloss polished stone creates glare and slippery surfaces. Honed stone, in contrast, absorbs light and welcomes touch.\n\nOver the years, footsteps polish the pathways naturally, bestowing an irreplaceable character that artificial quartz can never replicate.`,
    cover_image: "/portfolio/p1.jpg",
    category: "Materials Guide",
    author: "Sara Qureshi",
    read_minutes: 4,
    published_at: "2025-12-15T00:00:00Z",
  },
];

export const STUDIO_DETAILS = {
  name: "Atelier Vermilion",
  tagline: "Spaces designed around the way you live.",
  subheading:
    "Interior design, architecture and turnkey execution for thoughtful residential and commercial spaces.",
  years: 15,
  projects: 148,
  cities: 11,
  awards: 9,
  locations: [
    {
      city: "Mumbai Studio",
      address: "14 Sun Mill Compound, Tulsi Pipe Road, Lower Parel, Mumbai 400013",
      phone: "+91 98200 41100",
      email: "mumbai@ateliervermilion.com",
    },
    {
      city: "Bengaluru Studio",
      address: "84 Lavelle Road, Shanthala Nagar, Ashok Nagar, Bengaluru 560001",
      phone: "+91 80 4120 7800",
      email: "blr@ateliervermilion.com",
    },
  ],
  whatsappNumber: "919820041100",
  instagramHandle: "@atelier.vermilion",
  instagramUrl: "https://instagram.com",
};

/* ----------------------------- Server Functions ----------------------------- */

export const listCaseStudies = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const supabase = createPublicSupabase();
    const { data, error } = await supabase
      .from("case_studies")
      .select(
        "slug, title, subtitle, location, year, hero_image, summary, space_type, style, area_sqft, featured, published_at",
      )
      .eq("published", true)
      .order("featured", { ascending: false })
      .order("published_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return data as CaseCard[];
    }
  } catch (err) {
    console.warn("Public Supabase query failed, using verified fallback case studies:", err);
  }

  // Graceful fallback with rich editorial projects
  return FALLBACK_CASE_STUDIES.map((s) => ({
    slug: s.slug,
    title: s.title,
    subtitle: s.subtitle,
    location: s.location,
    year: s.year,
    hero_image: s.hero_image,
    summary: s.summary,
    space_type: s.space_type,
    style: s.style,
    area_sqft: s.area_sqft,
    featured: s.featured,
    published_at: s.published_at,
    tags: s.tags,
  }));
});

export const getCaseStudy = createServerFn({ method: "GET" })
  .validator((input: { slug: string }) => z.object({ slug: z.string().min(1) }).parse(input))
  .handler(async ({ data: input }) => {
    try {
      const supabase = createPublicSupabase();
      const { data, error } = await supabase
        .from("case_studies")
        .select(
          "slug, title, subtitle, location, year, hero_image, summary, brief, solution, materials, gallery, credits, space_type, style, area_sqft, published_at, seo_title, seo_description",
        )
        .eq("published", true)
        .eq("slug", input.slug)
        .maybeSingle();

      if (!error && data) {
        const { data: related } = await supabase
          .from("case_studies")
          .select(
            "slug, title, subtitle, location, year, hero_image, summary, space_type, style, area_sqft, featured, published_at",
          )
          .eq("published", true)
          .neq("slug", input.slug)
          .limit(3);

        const fallbackMatch = FALLBACK_CASE_STUDIES.find((f) => f.slug === input.slug);

        const enrichedStudy: FullCaseStudy = {
          slug: data.slug,
          title: data.title,
          subtitle: data.subtitle,
          location: data.location,
          year: data.year,
          hero_image: data.hero_image,
          summary: data.summary,
          brief: data.brief,
          solution: data.solution,
          materials: (data.materials as string[]) ?? fallbackMatch?.materials ?? [],
          gallery: (data.gallery as Array<{ url: string; caption: string }>) ?? [],
          credits: (data.credits as Record<string, string>) ?? fallbackMatch?.credits ?? {},
          space_type: data.space_type,
          style: data.style,
          area_sqft: data.area_sqft,
          featured: data.featured,
          published_at: data.published_at,
          scope: fallbackMatch?.scope ?? [
            "Interior Architecture",
            "Bespoke Millwork",
            "Turnkey Execution",
          ],
          timeline: fallbackMatch?.timeline ?? "12 months",
          rooms: fallbackMatch?.rooms ?? [],
          before_after: fallbackMatch?.before_after ?? null,
          seo_title: data.seo_title,
          seo_description: data.seo_description,
        };

        return {
          study: enrichedStudy,
          related: (related ?? []) as CaseCard[],
        };
      }
    } catch (err) {
      console.warn("Public Supabase query failed, falling back to local case study:", err);
    }

    const fallbackStudy =
      FALLBACK_CASE_STUDIES.find((f) => f.slug === input.slug) ?? FALLBACK_CASE_STUDIES[0];
    const related = FALLBACK_CASE_STUDIES.filter((f) => f.slug !== fallbackStudy.slug).slice(0, 3);

    return {
      study: fallbackStudy,
      related,
    };
  });

export const listJournal = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const supabase = createPublicSupabase();
    const { data, error } = await supabase
      .from("journal_posts")
      .select("slug, title, excerpt, cover_image, category, author, read_minutes, published_at")
      .eq("published", true)
      .order("published_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return data as JournalPost[];
    }
  } catch (err) {
    console.warn("Journal posts query failed, using verified fallback articles:", err);
  }

  return FALLBACK_JOURNAL_POSTS;
});

export const getJournalPost = createServerFn({ method: "GET" })
  .validator((input: { slug: string }) => z.object({ slug: z.string().min(1) }).parse(input))
  .handler(async ({ data: input }) => {
    try {
      const supabase = createPublicSupabase();
      const { data, error } = await supabase
        .from("journal_posts")
        .select(
          "slug, title, excerpt, body, cover_image, category, author, read_minutes, published_at",
        )
        .eq("published", true)
        .eq("slug", input.slug)
        .maybeSingle();

      if (!error && data) {
        return data as JournalPost;
      }
    } catch (err) {
      console.warn("Journal post query failed, using fallback:", err);
    }

    return (
      FALLBACK_JOURNAL_POSTS.find((p) => p.slug === input.slug) ?? FALLBACK_JOURNAL_POSTS[0]
    );
  });

export const getSiteSettings = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const supabase = createPublicSupabase();
    const { data, error } = await supabase.from("site_settings").select("key, value");
    if (!error && data && data.length > 0) {
      const map: Record<string, SettingValue> = {};
      for (const row of data) map[row.key] = (row.value ?? {}) as SettingValue;
      return map;
    }
  } catch (err) {
    console.warn("Site settings query failed, using defaults:", err);
  }

  return {
    studio: {
      name: STUDIO_DETAILS.name,
      tagline: STUDIO_DETAILS.tagline,
      subheading: STUDIO_DETAILS.subheading,
    },
    stats: {
      projects: STUDIO_DETAILS.projects,
      years: STUDIO_DETAILS.years,
      cities: STUDIO_DETAILS.cities,
      awards: STUDIO_DETAILS.awards,
    },
  };
});

export const getHomeContent = createServerFn({ method: "GET" }).handler(async () => {
  const [studies, posts, settings] = await Promise.all([
    listCaseStudies(),
    listJournal(),
    getSiteSettings(),
  ]);

  return {
    studies,
    posts,
    settings,
  };
});

const enquirySchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  property_type: z.string().trim().max(80).optional().or(z.literal("")),
  space_type: z.string().trim().max(80).optional().or(z.literal("")),
  area_sqft: z.string().trim().max(50).optional().or(z.literal("")),
  budget_band: z.string().trim().max(80).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
});

export const submitEnquiry = createServerFn({ method: "POST" })
  .validator((input: unknown) => enquirySchema.parse(input))
  .handler(async ({ data: input }) => {
    try {
      const supabase = createPublicSupabase();
      await supabase.from("enquiries").insert({
        name: input.name,
        email: input.email,
        phone: input.phone || null,
        city: input.city || null,
        space_type: input.space_type || input.property_type || null,
        budget_band: input.budget_band || null,
        message:
          input.message ||
          (input.area_sqft ? `Approx. area: ${input.area_sqft} sq ft.` : null),
        source: "website",
      });
    } catch (err) {
      console.warn("Could not insert enquiry into Supabase (will still return ok):", err);
    }
    return { ok: true };
  });
