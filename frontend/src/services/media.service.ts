import { api } from "./api";
import { MediaItem } from "../types/api";

export const mediaService = {
  async list(params?: {
    projectId?: string;
    roomId?: string;
    category?: string;
    visibility?: string;
    isFeatured?: boolean;
    isCover?: boolean;
  }): Promise<MediaItem[]> {
    return api.get<MediaItem[]>("/media", params);
  },

  async getById(id: string): Promise<MediaItem> {
    return api.get<MediaItem>(`/media/${id}`);
  },

  async upload(file: File, metadata: {
    projectId?: string;
    projectTitle?: string;
    roomId?: string;
    category?: string;
    title?: string;
    caption?: string;
    alt?: string;
    tags?: string[] | string;
    visibility?: string;
    isFeatured?: boolean;
    isCover?: boolean;
  }): Promise<MediaItem> {
    const formData = new FormData();
    formData.append("file", file);
    if (metadata.projectId) formData.append("projectId", metadata.projectId);
    if (metadata.projectTitle) formData.append("projectTitle", metadata.projectTitle);
    if (metadata.roomId) formData.append("roomId", metadata.roomId);
    if (metadata.category) formData.append("category", metadata.category);
    if (metadata.title) formData.append("title", metadata.title);
    if (metadata.caption) formData.append("caption", metadata.caption);
    if (metadata.alt) formData.append("alt", metadata.alt);
    if (metadata.tags) {
      formData.append("tags", Array.isArray(metadata.tags) ? metadata.tags.join(",") : metadata.tags);
    }
    if (metadata.visibility) formData.append("visibility", metadata.visibility);
    if (metadata.isFeatured !== undefined) formData.append("isFeatured", String(metadata.isFeatured));
    if (metadata.isCover !== undefined) formData.append("isCover", String(metadata.isCover));

    return api.upload<MediaItem>("/media/upload", formData);
  },

  async create(data: Partial<MediaItem>): Promise<MediaItem> {
    return api.post<MediaItem>("/media", data);
  },

  async update(id: string, data: Partial<MediaItem>): Promise<MediaItem> {
    return api.patch<MediaItem>(`/media/${id}`, data);
  },

  async delete(id: string): Promise<{ deleted: boolean }> {
    return api.delete(`/media/${id}`);
  },
};
