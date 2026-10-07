import { ApiResponse } from "../types/api";
import { API_BASE_URL } from "../config/api";

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  private getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("studio_auth_token");
    }
    return null;
  }

  public setToken(token: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem("studio_auth_token", token);
    }
  }

  public clearToken() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("studio_auth_token");
    }
  }

  private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
    const token = this.getToken();

    const headers = new Headers(options.headers || {});
    if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const config: RequestInit = {
      ...options,
      headers,
      credentials: "include", // Send HTTP-only cookies across requests
      cache: "no-store", // Ensure real-time parallel updates across panels without browser cache lag
    };

    let response: Response;
    try {
      response = await fetch(url, config);
    } catch (networkError: any) {
      console.error(`[API Network Error] ${options.method || "GET"} ${url}:`, networkError);
      throw new Error(`Network error connecting to backend API: ${networkError.message || "Server unreachable"}`);
    }

    let json: ApiResponse<T>;
    try {
      json = await response.json();
    } catch (parseError) {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return (null as unknown) as T;
    }

    if (!response.ok || json.success === false) {
      if (response.status === 401) {
        this.clearToken();
      }
      const errorMsg = json.message || `Request failed with status ${response.status}`;
      const err = new Error(errorMsg) as Error & { code?: string; details?: any; status: number };
      err.code = json.code;
      err.details = json.details;
      err.status = response.status;
      throw err;
    }

    return json.data;
  }

  public get<T = any>(endpoint: string, params?: Record<string, any>): Promise<T> {
    let query = "";
    if (params) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      }
      const qs = searchParams.toString();
      if (qs) query = `?${qs}`;
    }
    return this.request<T>(`${endpoint}${query}`, { method: "GET" });
  }

  public post<T = any>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body || {}),
    });
  }

  public patch<T = any>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: body instanceof FormData ? body : JSON.stringify(body || {}),
    });
  }

  public put<T = any>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body || {}),
    });
  }

  public delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  public upload<T = any>(endpoint: string, formData: FormData): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: formData,
    });
  }
}

export const api = new ApiClient(API_BASE_URL);
