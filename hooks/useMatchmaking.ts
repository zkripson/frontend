import { useEffect, useRef, useCallback } from "react";

interface UseMatchmakingOptions {
  stake: StakeValue;
  onFound: () => void;
  enabled: boolean;
}

export default function useMatchmaking({
  stake,
  onFound,
  enabled,
}: UseMatchmakingOptions) {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // TODO: Replace this with the real socket url
    const ws = new WebSocket(`wss://example.com/matchmaking?stake=${stake}`);
    wsRef.current = ws;

    ws.onmessage = (evt) => {
      const msg = JSON.parse(evt.data);
      if (msg.type === "MATCH_FOUND") {
        onFound();
      }
    };
    ws.onerror = () => {
      // Optionally handle error
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [stake, enabled, onFound]);

  const cancel = useCallback(() => {
    wsRef.current?.close();
  }, []);

  return { cancel };
}
