import rawDriveData from "./google-drive-photos-data.json";
import { publicService } from "../services/public.service";

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
 * Live async fetcher for gallery photos with backend Google Drive integration
 */
export async function getPublicGalleryPhotos(
  params: PhotoFilterParams = {},
): Promise<PaginatedPhotosResult> {
  try {
    const res: any = await publicService.getGallery({
      category: params.category,
      tag: params.tag,
      search: params.search,
      page: params.page,
      limit: params.limit,
      sortBy: params.sortBy,
    });

    if (res && Array.isArray(res.items) && res.items.length > 0) {
      return {
        items: res.items.map((item: any, idx: number) => ({
          id: item.id || item._id,
          index: (Number(params.page || 1) - 1) * Number(params.limit || 12) + idx + 1,
          fileName: item.fileName || item.title || "",
          title: item.title || item.caption || `Architectural Work #${idx + 1}`,
          caption: item.caption || item.description || item.title || "",
          category: item.category || "Living & Salon",
          projectId: item.projectId || "altamount-penthouse",
          projectTitle: item.projectTitle || "The Altamount Penthouse",
          projectCode: item.projectCode || "RA-01",
          location: item.location || "Mumbai",
          url: item.url || (item.driveFileId ? `https://lh3.googleusercontent.com/d/${item.driveFileId}` : ""),
          thumbnailUrl:
            item.thumbnailUrl ||
            item.thumbnail_url ||
            (item.driveFileId ? `https://drive.google.com/thumbnail?id=${item.driveFileId}&sz=w800` : ""),
          driveViewUrl: item.driveFileId ? `https://drive.google.com/file/d/${item.driveFileId}/view` : "",
          tags: Array.isArray(item.tags) ? item.tags : [],
          size: item.size,
          uploadedAt: item.createdAt,
        })),
        total: res.total || res.totalCount || res.items.length,
        page: res.currentPage || res.page || params.page || 1,
        limit: res.pageSize || res.limit || params.limit || 12,
        totalPages: res.totalPages || Math.ceil((res.total || res.items.length) / (params.limit || 12)),
        hasNextPage: res.hasNextPage ?? false,
        hasPrevPage: res.hasPrevPage ?? false,
        allCategories: res.allCategories || PHOTO_CATEGORIES,
        allTags: res.allTags || [],
        totalDriveAssets: res.totalDriveAssets || res.total || res.items.length,
      };
    }
  } catch (err) {
    console.warn("[Gallery] Live API query failed, fallback to local dataset:", err);
  }

  return getPaginatedGoogleDrivePhotos(params);
}

