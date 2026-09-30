import { api } from "./api";
import { ClientItem } from "../types/api";

export const clientsService = {
  async list(params?: { search?: string; status?: string }): Promise<ClientItem[]> {
    return api.get<ClientItem[]>("/clients", params);
  },

  async getById(id: string): Promise<ClientItem & { projects: any[] }> {
    return api.get(`/clients/${id}`);
  },

  async create(data: Partial<ClientItem>): Promise<ClientItem> {
    return api.post<ClientItem>("/clients", data);
  },

  async update(id: string, data: Partial<ClientItem>): Promise<ClientItem> {
    return api.patch<ClientItem>(`/clients/${id}`, data);
  },

  async delete(id: string): Promise<{ deleted: boolean }> {
    return api.delete(`/clients/${id}`);
  },
};
