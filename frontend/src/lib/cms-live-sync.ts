import { useEffect } from "react";
import { useQueryClient, QueryClient } from "@tanstack/react-query";

const BROADCAST_CHANNEL_NAME = "rads_cms_live_sync";
const STORAGE_KEY = "rads_cms_sync_timestamp";

let channel: BroadcastChannel | null = null;
if (typeof window !== "undefined" && "BroadcastChannel" in window) {
  try {
    channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  } catch {
    channel = null;
  }
}

/**
 * Broadcasts a live update signal across all browser tabs / panels.
 * When the Owner Panel updates photos, text, or projects, all open client tabs
 * will instantly refetch the latest data with 0ms delay.
 */
export function broadcastCmsUpdate(payload?: { type?: string; [key: string]: any }) {
  if (typeof window === "undefined") return;
  const data = { timestamp: Date.now(), ...(payload || {}) };
  try {
    channel?.postMessage(data);
  } catch {
    // ignore
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

/**
 * React hook to listen for live updates from Owner/Studio Panel across any open tab.
 * Automatically invalidates queries and triggers real-time UI refresh.
 */
export function useCmsLiveSync(passedQueryClient?: QueryClient | null, onUpdate?: () => void) {
  let contextQueryClient: QueryClient | null = null;
  try {
    contextQueryClient = useQueryClient();
  } catch {
    contextQueryClient = null;
  }
  const client = passedQueryClient || contextQueryClient;

  useEffect(() => {
    if (typeof window === "undefined" || !client) return;

    const handleSync = () => {
      client.invalidateQueries({ queryKey: ["home-content"] });
      client.invalidateQueries({ queryKey: ["public"] });
      client.invalidateQueries({ queryKey: ["cms"] });
      client.invalidateQueries({ queryKey: ["media"] });
      client.refetchQueries({ queryKey: ["home-content"] });
      client.refetchQueries({ queryKey: ["public"] });
      onUpdate?.();
    };

    const handleMessage = () => {
      handleSync();
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        handleSync();
      }
    };

    channel?.addEventListener("message", handleMessage);
    window.addEventListener("storage", handleStorage);

    return () => {
      channel?.removeEventListener("message", handleMessage);
      window.removeEventListener("storage", handleStorage);
    };
  }, [client, onUpdate]);
}
