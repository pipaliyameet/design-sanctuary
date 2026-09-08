import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMySession, type SessionInfo } from "@/lib/session.functions";

export function useSession() {
  const fetchSession = useServerFn(getMySession);
  return useQuery<SessionInfo>({
    queryKey: ["session"],
    queryFn: () => fetchSession(),
    staleTime: 60_000,
  });
}
