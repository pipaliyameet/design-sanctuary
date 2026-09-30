import { GOOGLE_DRIVE_PHOTOS, GoogleDrivePhoto } from "./drivePhotosRaw.js";

export { GOOGLE_DRIVE_PHOTOS };
export type { GoogleDrivePhoto };

export const PUBLIC_DRIVE_FOLDER_ID = "1ix9RDbXHK0JVqsxPyfxYL8M1bCdHdBze";
export const PUBLIC_DRIVE_FOLDER_URL = `https://drive.google.com/drive/folders/${PUBLIC_DRIVE_FOLDER_ID}`;

export function getPaginatedDrivePhotos(params: {
  category?: string;
  tag?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
}) {
  const {
    category = "All",
    tag = "All",
    search = "",
    page = 1,
    limit = 12,
    sortBy = "default",
  } = params;

  let filtered = GOOGLE_DRIVE_PHOTOS.filter((photo) => {
    if (category && category !== "All" && photo.category !== category) {
      return false;
    }
    if (tag && tag !== "All" && !photo.tags.some((t) => t.toLowerCase() === tag.toLowerCase())) {
      return false;
    }
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
  const items = filtered.slice(startIndex, startIndex + validLimit);

  return {
    items,
    total,
    page: validPage,
    limit: validLimit,
    totalPages,
    hasNextPage: validPage < totalPages,
    hasPrevPage: validPage > 1,
    allCategories: ["All", ...Array.from(new Set(GOOGLE_DRIVE_PHOTOS.map((p) => p.category)))],
    allTags: [
      "All",
      ...Array.from(new Set(GOOGLE_DRIVE_PHOTOS.flatMap((p) => p.tags || []))).filter(
        (t) => t !== "Google Drive Vault",
      ),
    ],
    totalDriveAssets: GOOGLE_DRIVE_PHOTOS.length,
    folderUrl: PUBLIC_DRIVE_FOLDER_URL,
  };
}
