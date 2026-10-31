import { api } from "./api";
import { SessionUser } from "../types/api";

export const authService = {
  async login(credentials: { email: string; password: string }): Promise<{ user: SessionUser; token: string }> {
    const data = await api.post<{ user: SessionUser; token: string }>("/auth/login", credentials);
    if (data?.token) {
      api.setToken(data.token);
    }
    if (data?.user && typeof window !== "undefined") {
      try {
        localStorage.setItem("studio_user", JSON.stringify(data.user));
      } catch {}
    }
    return data;
  },

  async ownerQuickLogin(): Promise<{ user: SessionUser; token: string }> {
    const data = await api.post<{ user: SessionUser; token: string }>("/auth/owner-login");
    if (data?.token) {
      api.setToken(data.token);
    }
    if (data?.user && typeof window !== "undefined") {
      try {
        localStorage.setItem("studio_user", JSON.stringify(data.user));
      } catch {}
    }
    return data;
  },

  async signup(payload: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    title?: string;
    role?: string;
  }): Promise<{ user: SessionUser; token: string }> {
    const data = await api.post<{ user: SessionUser; token: string }>("/auth/signup", payload);
    if (data?.token) {
      api.setToken(data.token);
    }
    if (data?.user && typeof window !== "undefined") {
      try {
        localStorage.setItem("studio_user", JSON.stringify(data.user));
      } catch {}
    }
    return data;
  },

  async logout(): Promise<{ ok: boolean }> {
    api.clearToken();
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("studio_user");
      } catch {}
    }
    try {
      return await api.post<{ ok: boolean }>("/auth/logout");
    } catch {
      return { ok: true };
    }
  },

  async getMe(): Promise<SessionUser | null> {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("studio_auth_token");
      if (!storedToken) {
        return null;
      }
    }

    try {
      const user = await api.get<SessionUser | null>("/auth/me");
      if (user && typeof window !== "undefined") {
        try {
          localStorage.setItem("studio_user", JSON.stringify(user));
        } catch {}
      }
      return user;
    } catch (err) {
      if (typeof window !== "undefined") {
        const storedToken = localStorage.getItem("studio_auth_token");
        if (storedToken) {
          const cached = localStorage.getItem("studio_user");
          if (cached) {
            try {
              return JSON.parse(cached);
            } catch {}
          }
        }
      }
      return null;
    }
  },

  async updateProfile(updates: { fullName?: string; title?: string; phone?: string }): Promise<{ user: SessionUser; token: string }> {
    const data = await api.patch<{ user: SessionUser; token: string }>("/auth/profile", updates);
    if (data?.token) {
      api.setToken(data.token);
    }
    return data;
  },
};

