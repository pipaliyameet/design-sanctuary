import rawDriveData from "./google-drive-photos-data.json";

export interface GoogleDrivePhoto {
  id: string;
  index: number;
  fileName: string;
  title: string;
  caption: string;
  category: string;
  projectId: string;
  projectTitle: string;
  projectCode: string;
  location: string;
  url: string;
  thumbnailUrl: string;
  driveViewUrl: string;
  tags: string[];
  size?: number;
  uploadedAt?: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
  orientation?: "landscape" | "portrait" | "square";
}

export const PUBLIC_DRIVE_FOLDER_ID = "1ix9RDbXHK0JVqsxPyfxYL8M1bCdHdBze";
export const PUBLIC_DRIVE_FOLDER_URL = `https://drive.google.com/drive/folders/${PUBLIC_DRIVE_FOLDER_ID}`;

export const GOOGLE_DRIVE_PHOTOS: GoogleDrivePhoto[] = rawDriveData as GoogleDrivePhoto[];

export const PHOTO_CATEGORIES = [
  "All",
  "Living & Salon",
  "Master Bedroom & Suites",
  "Dining & Show Kitchen",
  "Foyer & Architectural Joinery",
  "Courtyard & Terraces",
  "Bath & Spa Sanctuary",
  "Bespoke Materials & Lighting",
] as const;

export interface PhotoFilterParams {
  category?: string;
  tag?: string;
  search?: string;
  orientation?: "all" | "landscape" | "portrait";
  page?: number;
  limit?: number;
  sortBy?: "default" | "newest" | "title" | "project";
}

export interface PaginatedPhotosResult {
  items: GoogleDrivePhoto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  allCategories: string[];
  allTags: string[];
  totalDriveAssets: number;
}

export interface PhotoRowGroup {
  id: string;
  orientation: "landscape" | "portrait";
  items: GoogleDrivePhoto[];
}

/**
 * Dynamically organizes photos into homogeneous rows where:
 * - All photos in a landscape row are landscape
 * - All photos in a portrait row are portrait
 */
export function groupPhotosIntoOrientationRows(
  photos: GoogleDrivePhoto[],
  landscapePerRow = 2,
  portraitPerRow = 3,
): PhotoRowGroup[] {
  const rows: PhotoRowGroup[] = [];
  let currentGroup: GoogleDrivePhoto[] = [];
  let currentOrientation: "landscape" | "portrait" | null = null;

  for (const photo of photos) {
    const photoOrientation: "landscape" | "portrait" =
      photo.orientation === "portrait" || (photo.aspectRatio && photo.aspectRatio < 1)
        ? "portrait"
        : "landscape";

    const maxItems = photoOrientation === "landscape" ? landscapePerRow : portraitPerRow;

    if (currentOrientation === null) {
      currentOrientation = photoOrientation;
      currentGroup = [photo];
    } else if (currentOrientation === photoOrientation && currentGroup.length < maxItems) {
      currentGroup.push(photo);
    } else {
      // Push existing row
      rows.push({
        id: `row-${rows.length}-${currentOrientation}`,
        orientation: currentOrientation,
        items: currentGroup,
      });
      currentOrientation = photoOrientation;
      currentGroup = [photo];
    }
  }

  if (currentGroup.length > 0 && currentOrientation) {
    rows.push({
      id: `row-${rows.length}-${currentOrientation}`,
      orientation: currentOrientation,
      items: currentGroup,
    });
  }

  return rows;
}

export function getPaginatedGoogleDrivePhotos(
  params: PhotoFilterParams = {},
  customPhotos?: GoogleDrivePhoto[],
): PaginatedPhotosResult {
  const {
    category = "All",
    tag = "All",
    search = "",
    page = 1,
    limit = 12,
    sortBy = "default",
  } = params;

  const sourceList = customPhotos && customPhotos.length > 0 ? customPhotos : GOOGLE_DRIVE_PHOTOS;

  const allCategories = ["All", ...Array.from(new Set(sourceList.map((p) => p.category)))];
  const allTags = [
    "All",
    ...Array.from(new Set(sourceList.flatMap((p) => p.tags || []))).filter(
      (t) => t !== "Google Drive Vault",
    ),
  ];

  let filtered = sourceList.filter((photo) => {
    // Category match
    if (category && category !== "All" && photo.category !== category) {
      return false;
    }

    // Tag match
    if (tag && tag !== "All" && !photo.tags.some((t) => t.toLowerCase() === tag.toLowerCase())) {
      return false;
    }

    // Search query match
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      const matchFound =
        photo.title.toLowerCase().includes(q) ||
        photo.caption.toLowerCase().includes(q) ||
        photo.projectTitle.toLowerCase().includes(q) ||
        photo.location.toLowerCase().includes(q) ||
        photo.fileName.toLowerCase().includes(q) ||
        photo.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchFound) return false;
    }

    // Orientation match
    if (orientation && orientation !== "all") {
      const isPortrait = photo.orientation === "portrait" || (photo.aspectRatio && photo.aspectRatio < 1);
      if (orientation === "portrait" && !isPortrait) return false;
      if (orientation === "landscape" && isPortrait) return false;
    }

    return true;
  });

  // Sort
  if (sortBy === "title") {
    filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy === "project") {
    filtered = [...filtered].sort((a, b) => a.projectTitle.localeCompare(b.projectTitle));
  } else if (sortBy === "newest") {
    filtered = [...filtered].sort((a, b) => b.index - a.index);
  }

  const total = filtered.length;
  const validLimit = Math.max(1, limit);
  const totalPages = Math.ceil(total / validLimit) || 1;
  const validPage = Math.min(Math.max(1, page), totalPages);

  const startIndex = (validPage - 1) * validLimit;
  const paginatedItems = filtered.slice(startIndex, startIndex + validLimit);

  return {
    items: paginatedItems,
    total,
    page: validPage,
    limit: validLimit,
    totalPages,
    hasNextPage: validPage < totalPages,
    hasPrevPage: validPage > 1,
    allCategories,
    allTags,
    totalDriveAssets: sourceList.length,
  };
}

export function getDriveCoverPhoto(index = 0): string {
  if (GOOGLE_DRIVE_PHOTOS[index]) {
    return GOOGLE_DRIVE_PHOTOS[index]!.url;
  }
  return GOOGLE_DRIVE_PHOTOS[0]?.url || "https://lh3.googleusercontent.com/d/1Du9bv87hjZ8ySVHnckG5lSL1xQjvxogE";
}

/**
 * Robust async fetcher for gallery photos with instant local pagination
 */
export async function getPublicGalleryPhotos(
  params: PhotoFilterParams = {},
): Promise<PaginatedPhotosResult> {
  return getPaginatedGoogleDrivePhotos(params);
}

