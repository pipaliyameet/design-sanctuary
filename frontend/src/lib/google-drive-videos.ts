export interface DriveVideo {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  duration: string;
  year: number;
  location: string;
  videoSrc: string;
  streamUrl: string;
  posterUrl: string;
  driveFolderUrl: string;
  driveEmbedUrl: string;
  description: string;
  tags: string[];
  isFeatured?: boolean;
}

export const GOOGLE_DRIVE_VIDEOS_FOLDER_ID = "1RVz5DwORdVYsquHkOm97r8i1RvJGhi-Y";
export const GOOGLE_DRIVE_VIDEOS_FOLDER_URL = `https://drive.google.com/drive/folders/${GOOGLE_DRIVE_VIDEOS_FOLDER_ID}`;

// Curated Architectural Film & Walkthrough Reels from Right Angle Google Drive
export const ARCHITECTURAL_FILMS: DriveVideo[] = [
  {
    id: "film-01",
    title: "The Shah Courtyard Residence — Cinematic Walkthrough",
    subtitle: "A 6,400 sq ft pavilion structured around daylight, monolithic quartzite, and fluted teak millwork.",
    category: "Residential Architecture",
    duration: "03:45",
    year: 2026,
    location: "Ahmedabad, Gujarat",
    videoSrc: "/videos/architectural-film-01.mp4",
    streamUrl: "https://drive.usercontent.google.com/download?id=11E8B_lIp0tP7p19agB-AE7cg499W7nWc&export=download",
    posterUrl: "https://lh3.googleusercontent.com/d/1Du9bv87hjZ8ySVHnckG5lSL1xQjvxogE",
    driveFolderUrl: GOOGLE_DRIVE_VIDEOS_FOLDER_URL,
    driveEmbedUrl: "https://drive.google.com/file/d/11E8B_lIp0tP7p19agB-AE7cg499W7nWc/preview",
    description:
      "Experience the spatial journey through the double-height central atrium, private library niche, and shaded poolside verandah crafted with honest materials.",
    tags: ["Full Tour", "Daylight Study", "Travertine & Teak", "Turnkey Sanctuary"],
    isFeatured: true,
  },
  {
    id: "film-02",
    title: "The Altamount Penthouse — Twilight Material Study",
    subtitle: "Evening ambiance illuminated by concealed 2700K architectural cove lighting and smoked oak joinery.",
    category: "Penthouse & Luxury Interiors",
    duration: "02:18",
    year: 2026,
    location: "South Mumbai",
    videoSrc: "/videos/architectural-film-02.mp4",
    streamUrl: "https://drive.usercontent.google.com/download?id=12S56ct9HKchc4qP44WfHlu7itB58qUm_&export=download",
    posterUrl: "https://lh3.googleusercontent.com/d/18ZSfvj53ZvlAwj7l6-7la5FHHXcbadWg",
    driveFolderUrl: GOOGLE_DRIVE_VIDEOS_FOLDER_URL,
    driveEmbedUrl: "https://drive.google.com/file/d/12S56ct9HKchc4qP44WfHlu7itB58qUm_/preview",
    description:
      "A deep dive into tactile surface curation: how dark fluted wall paneling and Belgian linen drapery filter coastal evening light.",
    tags: ["Twilight Film", "Lighting Design", "Custom Joinery"],
  },
  {
    id: "film-03",
    title: "Mehta Executive Suite — Craftsmanship & Details",
    subtitle: "Precision joinery, vein-matched Roman travertine portals, and custom patinated bronze handles.",
    category: "Commercial & Executive Suites",
    duration: "01:54",
    year: 2026,
    location: "Rajkot, Gujarat",
    videoSrc: "/videos/architectural-film-03.mp4",
    streamUrl: "https://drive.usercontent.google.com/download?id=1DMaemNi3O0jRhHrDVJO8VCpahlIwk9mt&export=download",
    posterUrl: "https://lh3.googleusercontent.com/d/1YXSBTgbi5JUhDBtEQzQALMB_e3PAGd8r",
    driveFolderUrl: GOOGLE_DRIVE_VIDEOS_FOLDER_URL,
    driveEmbedUrl: "https://drive.google.com/file/d/1DMaemNi3O0jRhHrDVJO8VCpahlIwk9mt/preview",
    description:
      "Macro lens documentation of raw brass patination, acoustic micro-cement finishes, and concealed door hardware.",
    tags: ["Craft Film", "Stone Detailing", "Bespoke Hardware"],
  },
];
