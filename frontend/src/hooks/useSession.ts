import { useQuery } from "@tanstack/react-query";
import { getMySession, type SessionInfo } from "@/lib/session.functions";

export function useSession() {
  return useQuery<SessionInfo | null>({
    queryKey: ["session"],
    queryFn: () => getMySession(),
    staleTime: 60_000,
  });
}
