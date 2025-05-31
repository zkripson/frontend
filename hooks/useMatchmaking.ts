import { useEffect, useRef, useState, useCallback } from "react";

import { useMatchMakingActions } from "@/store/matchmaking/actions";
import { setMatchMaking } from "@/store/matchmaking";
import {
  QuickplayWebSocketService,
  QuickplayMessage,
} from "@/services/QuickplayWebSocketService";
import useAppActions from "@/store/app/actions";
import { usePlayerActions } from "@/store/player/actions";
import usePrivyLinkedAccounts from "./usePrivyLinkedAccounts";
import useSystemFunctions from "./useSystemFunctions";

interface UseMatchmakingOptions {
  enabled: boolean;
  onFound: (msg: QuickplayMessage) => void;
  onCreated: (msg: QuickplayMessage) => void;
  onFailed?: (msg: QuickplayMessage) => void;
  onTimeout?: (msg: QuickplayMessage) => void;
}

export default function useMatchmaking({
  enabled,
  onFound,
  onCreated,
  onFailed,
  onTimeout,
}: UseMatchmakingOptions) {
  const { activeWallet } = usePrivyLinkedAccounts();
  const { leaveMatchPool } = useMatchMakingActions();
  const { dispatch } = useSystemFunctions();
  const { showToast } = useAppActions();
  const { getOngoingSessions } = usePlayerActions();

  const wsRef = useRef<QuickplayWebSocketService | null>(null);

  const [status, setStatus] = useState<"idle" | "searching" | "error">("idle");
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!enabled) {
      wsRef.current?.disconnect();
      wsRef.current = null;
      setStatus("idle");
      return;
    }
    if (!activeWallet) return;

    setStatus("searching");

    const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;

    const svc = new QuickplayWebSocketService(baseUrl!, activeWallet);

    wsRef.current = svc;

    // 1) opponent found → backend starting session creation
    svc.on("match_found", (msg) => {
      console.log(msg);
      dispatch(
        setMatchMaking({
          status: msg.status,
          opponent: msg.opponent,
          message: msg.message,
        })
      );
      onFound(msg);
    });

    // 2) session created → safe to route
    svc.on("match_created", (msg) => {
      console.log(msg);
      dispatch(
        setMatchMaking({
          status: msg.status,
          sessionId: msg.sessionId,
          opponent: msg.opponent,
          isBettingGame: msg.isBettingGame,
          message: msg.message,
        })
      );
      getOngoingSessions();
      onCreated(msg);
    });

    // 3) match failed → toast + back to searching
    svc.on("match_failed", (msg) => {
      console.log(msg);
      showToast(
        "Unable to create the match. Searching for another player.",
        "error"
      );
      onFailed?.(msg);
      setStatus("searching");
    });

    // 4) timeout → toast + back to select
    svc.on("timeout", (msg) => {
      console.log(msg);
      showToast("Could not find a match. Please try again.", "error");
      onTimeout?.(msg);
      svc.disconnect();
      leaveMatchPool();
      setStatus("idle");
    });

    // generic connection errors
    svc.on("error", (errMsg) => {
      console.log(errMsg);
      setStatus("error");
      setError(errMsg);
      showToast("An error occurred. Please try again.", "error");
    });

    svc.connect();
    return () => {
      svc.disconnect();
      leaveMatchPool();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, activeWallet]);

  const cancel = useCallback(() => {
    wsRef.current?.disconnect();
    leaveMatchPool();
    setStatus("idle");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    status,
    isSearching: status === "searching",
    isError: status === "error",
    error,
    cancel,
  };
}
