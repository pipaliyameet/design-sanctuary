import { getApiBaseUrl } from "@/config/api";

export interface DriveVideo {
  id: string;
  driveFileId: string;
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

export function getVideoStreamUrl(driveFileId: string): string {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}/media/stream-video/${driveFileId}`;
}

export function extractDriveFileId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (/^[a-zA-Z0-9_-]{25,50}$/.test(trimmed)) {
    return trimmed;
  }
  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) return fileDMatch[1];
  const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch && idMatch[1]) return idMatch[1];
  const dMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (dMatch && dMatch[1]) return dMatch[1];
  return null;
}

export const DRIVE_ID_TO_LOCAL_VIDEO: Record<string, string> = {
  "11E8B_lIp0tP7p19agB-AE7cg499W7nWc": "/videos/architectural-film-01.mp4",
  "12S56ct9HKchc4qP44WfHlu7itB58qUm_": "/videos/architectural-film-02.mp4",
  "1DMaemNi3O0jRhHrDVJO8VCpahlIwk9mt": "/videos/architectural-film-03.mp4",
};

export function resolveVideoStreamUrl(driveFileId?: string, fallbackUrl?: string): string {
  if (driveFileId && DRIVE_ID_TO_LOCAL_VIDEO[driveFileId]) {
    return DRIVE_ID_TO_LOCAL_VIDEO[driveFileId];
  }
  if (fallbackUrl) {
    for (const [id, localPath] of Object.entries(DRIVE_ID_TO_LOCAL_VIDEO)) {
      if (fallbackUrl.includes(id)) return localPath;
    }
    if (fallbackUrl.startsWith("/videos/")) {
      return fallbackUrl;
    }
  }
  if (driveFileId) {
    return getVideoStreamUrl(driveFileId);
  }
  return fallbackUrl || "/videos/architectural-film-01.mp4";
}

export function buildDriveVideoUrls(driveFileId: string) {
  const localMatch = DRIVE_ID_TO_LOCAL_VIDEO[driveFileId];
  return {
    streamUrl: localMatch || getVideoStreamUrl(driveFileId),
    driveEmbedUrl: `https://drive.google.com/file/d/${driveFileId}/preview`,
    posterUrl: `https://drive.google.com/thumbnail?id=${driveFileId}&sz=w1600`,
    directUrl: `https://lh3.googleusercontent.com/d/${driveFileId}`,
  };
}

// All available Google Drive reels in the studio vault (available in Drive Reel Picker)
export const KNOWN_DRIVE_VIDEOS: DriveVideo[] = [
  {
    id: "film-01",
    driveFileId: "11E8B_lIp0tP7p19agB-AE7cg499W7nWc",
    title: "The Shah Courtyard Residence — Cinematic Walkthrough",
    subtitle: "A 6,400 sq ft pavilion structured around daylight, monolithic quartzite, and fluted teak millwork.",
    category: "Residential Architecture",
    duration: "03:45",
    year: 2026,
    location: "Ahmedabad, Gujarat",
    videoSrc: "/videos/architectural-film-01.mp4",
    streamUrl: "/videos/architectural-film-01.mp4",
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
    driveFileId: "12S56ct9HKchc4qP44WfHlu7itB58qUm_",
    title: "The Altamount Penthouse — Twilight Material Study",
    subtitle: "Evening ambiance illuminated by concealed 2700K architectural cove lighting and smoked oak joinery.",
    category: "Penthouse & Luxury Interiors",
    duration: "02:18",
    year: 2026,
    location: "South Mumbai",
    videoSrc: "/videos/architectural-film-02.mp4",
    streamUrl: "/videos/architectural-film-02.mp4",
    posterUrl: "https://lh3.googleusercontent.com/d/18ZSfvj53ZvlAwj7l6-7la5FHHXcbadWg",
    driveFolderUrl: GOOGLE_DRIVE_VIDEOS_FOLDER_URL,
    driveEmbedUrl: "https://drive.google.com/file/d/12S56ct9HKchc4qP44WfHlu7itB58qUm_/preview",
    description:
      "A deep dive into tactile surface curation: how dark fluted wall paneling and Belgian linen drapery filter coastal evening light.",
    tags: ["Twilight Film", "Lighting Design", "Custom Joinery"],
  },
  {
    id: "film-03",
    driveFileId: "1DMaemNi3O0jRhHrDVJO8VCpahlIwk9mt",
    title: "Mehta Executive Suite — Craftsmanship & Details",
    subtitle: "Precision joinery, vein-matched Roman travertine portals, and custom patinated bronze handles.",
    category: "Commercial & Executive Suites",
    duration: "01:54",
    year: 2026,
    location: "Rajkot, Gujarat",
    videoSrc: "/videos/architectural-film-03.mp4",
    streamUrl: "/videos/architectural-film-03.mp4",
    posterUrl: "https://lh3.googleusercontent.com/d/1YXSBTgbi5JUhDBtEQzQALMB_e3PAGd8r",
    driveFolderUrl: GOOGLE_DRIVE_VIDEOS_FOLDER_URL,
    driveEmbedUrl: "https://drive.google.com/file/d/1DMaemNi3O0jRhHrDVJO8VCpahlIwk9mt/preview",
    description:
      "Macro lens documentation of raw brass patination, acoustic micro-cement finishes, and concealed door hardware.",
    tags: ["Craft Film", "Stone Detailing", "Bespoke Hardware"],
  },
];

// Single Active Architectural Reel (reels 02 and 03 removed as requested by owner)
export const ARCHITECTURAL_FILMS: DriveVideo[] = [
  KNOWN_DRIVE_VIDEOS[0]!,
];
