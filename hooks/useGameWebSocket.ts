"use client";

import { useEffect, useRef, useState } from "react";
import { GameWebSocketService } from "../services/GameWebSocketService";
import useSystemFunctions from "./useSystemFunctions";
import usePrivyLinkedAccounts from "./usePrivyLinkedAccounts";

// Types for WebSocket messages
export interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export interface SessionStateMessage extends WebSocketMessage {
  type: "session_state";
  sessionId: string;
  status: string;
  players: string[];
  currentTurn: string | null;
  gameId: string | null;
  gameContractAddress: string | null;
}

export interface PlayerJoinedMessage extends WebSocketMessage {
  type: "player_joined";
  address: string;
  players: string[];
  status: string;
}

export interface BoardSubmittedMessage extends WebSocketMessage {
  type: "board_submitted";
  player: string;
  allBoardsSubmitted: boolean;
  gameStatus: string;
}

export interface GameStartedMessage extends WebSocketMessage {
  type: "game_started";
  status: string;
  currentTurn: string;
  gameContractAddress: string;
  gameId: string;
  turnStartedAt: number;
}

export interface ShotFiredMessage extends WebSocketMessage {
  type: "shot_fired";
  player: string;
  x: number;
  y: number;
  nextTurn: string;
  turnStartedAt: number;
}

export interface ShotResultMessage extends WebSocketMessage {
  type: "shot_result";
  player: string;
  x: number;
  y: number;
  isHit: boolean;
}

export interface TurnTimeoutMessage extends WebSocketMessage {
  message: string;
  nextTurn: string;
  previousPlayer: string;
  turnStartedAt: number;
  type: "turn_timeout";
}

export type GameOverPointsSummary = Record<
  string,
  {
    total: number;
    breakdown: Array<{
      category: PointsSummary;
      points: number;
      reason: string;
    }>;
  }
>;

export interface GameOverProcessingMessage extends WebSocketMessage {
  type: "game_end_processing";
  status: "processing";
  winner: string;
  reason: string;
  message: string;
  isBettingGame: boolean;
  timestamp: number;
}

export interface GameOverMessage extends WebSocketMessage {
  type: "game_end_completed";
  status: "completed";
  winner: string;
  reason: "COMPLETED" | "FORFEIT" | "TIMEOUT" | "TIME_LIMIT";
  finalState: {
    shots: Array<{ x: number; y: number; player: string }>;
    sunkShips: Record<string, number>;
    gameStartedAt: number;
    gameEndedAt: number;
    duration: number;
    isBettingGame: boolean;
    bettingInfo: {
      inviteId: string;
      totalPool: string;
      resolved: boolean;
    };
  };
  playerStats: Record<
    string,
    {
      address: string;
      shotsCount: number;
      hitsCount: number;
      accuracy: number;
      shipsSunk: number;
      avgTurnTime: number;
    }
  >;
  pointsAwarded: Record<string, number>;
  pointsSummary: GameOverPointsSummary;
  bettingResolved: boolean;
  bettingPayouts: {
    winner: {
      address: string;
      amount: string;
    };
    loser: {
      address: string;
      amount: string;
    };
  };
  timestamp: number;
}

export type PointsSummary =
  | "GAME_PLAYED"
  | "GAME_WON"
  | "GAME_LOST"
  | "GAME_DRAW"
  | "SHOT_EFFICIENCY"
  | "QUICK_GAME"
  | "WIN_STREAK"
  | "DAILY_PLAYER"
  | "REFERRAL_REWARD"
  | "FIRST_HIT"
  | "SHIP_SUNK_BONUS"
  | "HIGH_ACCURACY"
  | "WEEKLY_COMMITMENT"
  | "PARTICIPATION"
  | "VICTORY"
  | "FIRST_BLOOD"
  | "SHIP_DESTROYER";

export interface PointsSummaryMessage extends WebSocketMessage {
  type: "points_summary";
  totalPoints: number;
  breakdown: Record<PointsSummary, number>;
  isWinner: boolean;
}

export interface PointsAwardedMessage extends WebSocketMessage {
  type: "points_awarded";
  points: number;
  category: PointsSummary;
  totalPoints: number;
  player: string;
}

export interface DrawRematch extends WebSocketMessage {
  type: "draw_rematch";
}

export interface RematchReady extends WebSocketMessage {
  type: "rematch_ready";
}

export interface ErrorMessage extends WebSocketMessage {
  type: "error";
  error: string;
  details?: string;
}

export interface PongMessage extends WebSocketMessage {
  type: "pong";
  timestamp: number;
}

/**
 * Custom hook to manage WebSocket connection for game sessions
 * @param sessionId The ID of the game session
 * @returns Object containing WebSocket state and event handler registration methods
 */
export function useGameWebSocket(sessionId: string) {
  const { activeWallet } = usePrivyLinkedAccounts();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const wsServiceRef = useRef<GameWebSocketService | null>(null);

  // Create or use existing WebSocket service
  useEffect(() => {
    if (!sessionId || !activeWallet?.address) return;

    const playerAddress = activeWallet.address;
    const baseUrl = "https://zk-battleship-backend.nj-345.workers.dev";

    if (!wsServiceRef.current) {
      wsServiceRef.current = new GameWebSocketService(
        baseUrl,
        sessionId,
        playerAddress
      );

      // Set up basic connection status handlers
      wsServiceRef.current.on("open", () => {
        setIsConnected(true);
        setConnectionError(null);
      });

      wsServiceRef.current.on("close", () => {
        setIsConnected(false);
      });

      wsServiceRef.current.on("error", (error) => {
        setConnectionError("WebSocket connection error");
      });
    }

    // Connect to the WebSocket server
    wsServiceRef.current.connect();

    // Cleanup function to disconnect when the component unmounts
    return () => {
      if (wsServiceRef.current) {
        wsServiceRef.current.disconnect();
        wsServiceRef.current = null;
      }
    };
  }, [sessionId, activeWallet?.address]);

  /**
   * Registers a handler for a specific message type
   * @param eventType The type of event to handle
   * @param handler The function to call when the event occurs
   */
  /**
   * Type-safe event registration for WebSocket message types
   */
  const on = {
    session_state: (handler: (data: SessionStateMessage) => void) => {
      if (wsServiceRef.current) {
        wsServiceRef.current.on(
          "session_state",
          handler as (data: any) => void
        );
      }
    },
    player_joined: (handler: (data: PlayerJoinedMessage) => void) => {
      if (wsServiceRef.current) {
        wsServiceRef.current.on(
          "player_joined",
          handler as (data: any) => void
        );
      }
    },
    board_submitted: (handler: (data: BoardSubmittedMessage) => void) => {
      if (wsServiceRef.current) {
        wsServiceRef.current.on(
          "board_submitted",
          handler as (data: any) => void
        );
      }
    },
    game_started: (handler: (data: GameStartedMessage) => void) => {
      if (wsServiceRef.current) {
        wsServiceRef.current.on("game_started", handler as (data: any) => void);
      }
    },
    shot_fired: (handler: (data: ShotFiredMessage) => void) => {
      if (wsServiceRef.current) {
        wsServiceRef.current.on("shot_fired", handler as (data: any) => void);
      }
    },
    shot_result: (handler: (data: ShotResultMessage) => void) => {
      if (wsServiceRef.current) {
        wsServiceRef.current.on("shot_result", handler as (data: any) => void);
      }
    },
    game_end_processing: (
      handler: (data: GameOverProcessingMessage) => void
    ) => {
      if (wsServiceRef.current) {
        wsServiceRef.current.on(
          "game_end_processing",
          handler as (data: any) => void
        );
      }
    },
    game_end_completed: (handler: (data: GameOverMessage) => void) => {
      if (wsServiceRef.current) {
        wsServiceRef.current.on(
          "game_end_completed",
          handler as (data: any) => void
        );
      }
    },
    turn_timeout: (handler: (data: TurnTimeoutMessage) => void) => {
      if (wsServiceRef.current) {
        wsServiceRef.current.on("turn_timeout", handler as (data: any) => void);
      }
    },

    points_awarded: (handler: (data: PointsAwardedMessage) => void) => {
      if (wsServiceRef.current) {
        wsServiceRef.current.on(
          "points_awarded",
          handler as (data: any) => void
        );
      }
    },

    points_summary: (handler: (data: PointsSummaryMessage) => void) => {
      if (wsServiceRef.current) {
        wsServiceRef.current.on(
          "points_summary",
          handler as (data: any) => void
        );
      }
    },

    draw_rematch: (handler: (data: DrawRematch) => void) => {
      if (wsServiceRef.current) {
        wsServiceRef.current.on("draw_rematch", handler as (data: any) => void);
      }
    },

    rematch_ready: (handler: (data: RematchReady) => void) => {
      if (wsServiceRef.current) {
        wsServiceRef.current.on(
          "rematch_ready",
          handler as (data: any) => void
        );
      }
    },

    error: (handler: (data: ErrorMessage) => void) => {
      if (wsServiceRef.current) {
        wsServiceRef.current.on("error", handler as (data: any) => void);
      }
    },
    pong: (handler: (data: PongMessage) => void) => {
      if (wsServiceRef.current) {
        wsServiceRef.current.on("pong", handler as (data: any) => void);
      }
    },
    // Generic handler for other message types
    message: <T extends WebSocketMessage>(
      eventType: T["type"],
      handler: (data: T) => void
    ) => {
      if (wsServiceRef.current) {
        wsServiceRef.current.on(eventType, handler as (data: any) => void);
      }
    },
  };

  /**
   * Type-safe event unregistration for WebSocket message types
   */
  const off = {
    session_state: (handler: (data: SessionStateMessage) => void) => {
      if (wsServiceRef.current) {
        wsServiceRef.current.off(
          "session_state",
          handler as (data: any) => void
        );
      }
    },
    player_joined: (handler: (data: PlayerJoinedMessage) => void) => {
      if (wsServiceRef.current) {
        wsServiceRef.current.off(
          "player_joined",
          handler as (data: any) => void
        );
      }
    },
    board_submitted: (handler: (data: BoardSubmittedMessage) => void) => {
      if (wsServiceRef.current) {
        wsServiceRef.current.off(
          "board_submitted",
          handler as (data: any) => void
        );
      }
    },
    game_started: (handler: (data: GameStartedMessage) => void) => {
      if (wsServiceRef.current) {
        wsServiceRef.current.off(
          "game_started",
          handler as (data: any) => void
        );
      }
    },
    shot_fired: (handler: (data: ShotFiredMessage) => void) => {
      if (wsServiceRef.current) {
        wsServiceRef.current.off("shot_fired", handler as (data: any) => void);
      }
    },
    shot_result: (handler: (data: ShotResultMessage) => void) => {
      if (wsServiceRef.current) {
        wsServiceRef.current.off("shot_result", handler as (data: any) => void);
      }
    },
    turn_timeout: (handler: (data: TurnTimeoutMessage) => void) => {
      if (wsServiceRef.current) {
        wsServiceRef.current.off(
          "turn_timeout",
          handler as (data: any) => void
        );
      }
    },
    game_end_processing: (
      handler: (data: GameOverProcessingMessage) => void
    ) => {
      if (wsServiceRef.current) {
        wsServiceRef.current.off(
          "game_end_processing",
          handler as (data: any) => void
        );
      }
    },
    game_end_completed: (handler: (data: GameOverMessage) => void) => {
      if (wsServiceRef.current) {
        wsServiceRef.current.off(
          "game_end_completed",
          handler as (data: any) => void
        );
      }
    },
    points_awarded: (handler: (data: PointsAwardedMessage) => void) => {
      if (wsServiceRef.current) {
        wsServiceRef.current.on(
          "points_awarded",
          handler as (data: any) => void
        );
      }
    },

    points_summary: (handler: (data: PointsSummaryMessage) => void) => {
      if (wsServiceRef.current) {
        wsServiceRef.current.on(
          "points_summary",
          handler as (data: any) => void
        );
      }
    },

    draw_rematch: (handler: (data: DrawRematch) => void) => {
      if (wsServiceRef.current) {
        wsServiceRef.current.on("draw_rematch", handler as (data: any) => void);
      }
    },

    rematch_ready: (handler: (data: RematchReady) => void) => {
      if (wsServiceRef.current) {
        wsServiceRef.current.on(
          "rematch_ready",
          handler as (data: any) => void
        );
      }
    },
    error: (handler: (data: ErrorMessage) => void) => {
      if (wsServiceRef.current) {
        wsServiceRef.current.off("error", handler as (data: any) => void);
      }
    },
    pong: (handler: (data: PongMessage) => void) => {
      if (wsServiceRef.current) {
        wsServiceRef.current.off("pong", handler as (data: any) => void);
      }
    },
    // Generic handler for other message types
    message: <T extends WebSocketMessage>(
      eventType: T["type"],
      handler: (data: T) => void
    ) => {
      if (wsServiceRef.current) {
        wsServiceRef.current.off(eventType, handler as (data: any) => void);
      }
    },
  };

  /**
   * Sends a message to the server
   * @param message The message to send
   */
  const send = (message: WebSocketMessage) => {
    if (wsServiceRef.current && wsServiceRef.current.isConnected()) {
      wsServiceRef.current.send(message);
    } else {
      console.error("Cannot send message: WebSocket is not connected");
    }
  };

  /**
   * Reconnects to the WebSocket server
   */
  const reconnect = () => {
    if (wsServiceRef.current) {
      wsServiceRef.current.connect();
    }
  };

  return {
    isConnected,
    connectionError,
    on,
    off,
    send,
    reconnect,
  };
}

export default useGameWebSocket;
