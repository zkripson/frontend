"use client";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

import useGameActions from "@/store/game/actions";
import useSystemFunctions from "@/hooks/useSystemFunctions";
import useGameWebSocket, {
  BoardSubmittedMessage,
  TurnTimeoutMessage,
} from "@/hooks/useGameWebSocket";
import usePrivyLinkedAccounts from "@/hooks/usePrivyLinkedAccounts";
import { useParams } from "next/navigation";
import { useLoadingSequence } from "@/hooks/useLoadingSequence";
import { LoadingOverlay } from "./components/LoadingOverlay";
import { GameHeader } from "./components/GameHeader";
import { SetupPanel } from "./components/SetupPanel";
import GameBoardContainer from "./components/GameBoardContainer";
import GameFooter from "./components/GameFooter";
import VictoryStatus from "./components/VictoryStatus";
import { useToggleInfo } from "@/hooks/useToggleInfo";
import { GeneralMessageKey } from "./components/general";
import { useAudio } from "@/providers/AudioProvider";

// Helper function to calculate turn time
const calculateAvgTurnTime = (
  currentAvg: number,
  totalShots: number,
  newTurnTime: number
) => {
  return Math.round((currentAvg * totalShots + newTurnTime) / (totalShots + 1));
};

// Game state types
interface GameState {
  sessionId: string | null;
  players: string[];
  gameStatus: string;
  currentTurn: string | null;
  gameStartedAt: number | null;
  turnStartedAt: number | null;
  playerBoard: number[][];
  enemyBoard: number[][];
  ships: Ship[];
  winner: string | null;
  finalState?: {
    shots: Array<{
      player: string;
      x: number;
      y: number;
      isHit: boolean;
      timestamp: number;
    }>;
    sunkShips: Record<string, number>;
    gameStartedAt: number;
    gameEndedAt: number;
    duration: number;
    isBettingGame: boolean;
  };
  playerStats?: Record<
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
}

interface Ship {
  id: string;
  name: string;
  length: number;
  cells: { x: number; y: number }[];
}

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const loadingMessages: string[] = [
  "Creating opponent fleet...",
  "Completing fleet coordinates...",
  "Loading battleships and environments...",
  "Initializing smart contract...",
  "Deploying smart contract...",
];

function getPlayerStatus({
  gameStatus,
  players,
  address,
  hasSubmitted,
  isSelf,
  selfAddress,
  opponentAddress,
}: {
  gameStatus: string;
  players: string[];
  address: string;
  hasSubmitted: boolean;
  isSelf: boolean;
  selfAddress: string;
  opponentAddress: string;
}) {
  const isJoined = players.includes(address);
  const bothJoined =
    players.length === 2 &&
    players.includes(selfAddress) &&
    players.includes(opponentAddress);

  if (!isJoined) return isSelf ? "Waiting..." : "joining";

  if (!bothJoined) return isSelf ? "Waiting..." : "joining";

  if (gameStatus === "CREATED" || gameStatus === "WAITING") return "Joined";
  if (gameStatus === "SETUP") return hasSubmitted ? "Ready" : "Setup";
  if (gameStatus === "ACTIVE") return "Active";
  if (gameStatus === "COMPLETED") return "Completed";
  return "";
}

const GameSession = () => {
  const params = useParams();
  const { evmWallet } = usePrivyLinkedAccounts();
  const { gameState, navigate } = useSystemFunctions();
  const gameActions = useGameActions();
  const [turnTimer, setTurnTimer] = useState<NodeJS.Timeout | null>(null);
  const [gameTimer, setGameTimer] = useState<NodeJS.Timeout | null>(null);
  const { messages, loadingDone } = useLoadingSequence(loadingMessages);
  const [generalMessage, setGeneralMessage] = useState<{
    key: GeneralMessageKey;
    id: number;
    shipName?: string;
  } | null>(null);

  // Initialize game state
  const [gameStateLocal, setGameStateLocal] = useState<
    GameState & {
      sunkEnemyShips: {
        id: string;
        name: string;
        cells: { x: number; y: number }[];
      }[];
    }
  >({
    sessionId: params.sessionId as string,
    players: [],
    gameStatus: "CREATED",
    currentTurn: null,
    gameStartedAt: null,
    turnStartedAt: null,
    playerBoard: Array(10)
      .fill(0)
      .map(() => Array(10).fill(0)),
    enemyBoard: Array(10)
      .fill(0)
      .map(() => Array(10).fill(0)),
    ships: [],
    winner: null,
    sunkEnemyShips: [],
    finalState: {
      shots: [],
      sunkShips: {},
      gameStartedAt: 0,
      gameEndedAt: 0,
      duration: 0,
      isBettingGame: false,
    },
    playerStats: {},
  });

  const [turnTimeRemaining, setTurnTimeRemaining] = useState(15);
  const [gameTimeRemaining, setGameTimeRemaining] = useState(180);

  // Audio context is now provided by AudioProvider

  // Play sound effects using AudioProvider
  const audio = useAudio();
  const playSound = useCallback(
    (type: "hit" | "miss" | "place") => {
      if (audio) {
        audio.play(type);
      }
    },
    [audio]
  );

  // Game functions
  const makeShot = async (x: number, y: number) => {
    // First check if game is active
    if (gameStateLocal.gameStatus !== "ACTIVE") {
      console.error("Game is not active");
      return;
    }

    // Then check if it's the player's turn and cell hasn't been shot
    if (
      !evmWallet?.address ||
      gameStateLocal.currentTurn !== evmWallet.address
    ) {
      console.error("Not your turn");
      return;
    }
    if (gameStateLocal.enemyBoard[y][x] !== 0) {
      console.error("Cell already shot");
      return;
    }

    try {
      await gameActions.makeShot({
        x,
        y,
        address: evmWallet.address,
      });
    } catch (error) {
      console.error("Error making shot:", error);
    }
  };

  // Timer functions
  const clearTimers = useCallback(() => {
    if (turnTimer) {
      clearInterval(turnTimer);
      setTurnTimer(null);
    }
    if (gameTimer) {
      clearInterval(gameTimer);
      setGameTimer(null);
    }
  }, [turnTimer, gameTimer]);

  // Monitor turnStartedAt changes directly
  useEffect(() => {
    const turnStartTime = gameStateLocal.turnStartedAt;
    if (turnStartTime && gameStateLocal.gameStatus === "ACTIVE") {
      // Set initial turn time to 15 seconds
      setTurnTimeRemaining(15);

      // Start new timer
      const timer = setInterval(() => {
        setTurnTimeRemaining((prev) => {
          const newValue = Math.max(0, prev - 1);
          if (newValue === 0) {
            clearInterval(timer);
          }
          return newValue;
        });
      }, 1000);

      // Cleanup on unmount or when turnStartedAt changes
      return () => clearInterval(timer);
    }
  }, [gameStateLocal.turnStartedAt, gameStateLocal.gameStatus]);

  // Monitor game time separately
  useEffect(() => {
    const gameStartTime = gameStateLocal.gameStartedAt;
    if (gameStartTime && gameStateLocal.gameStatus === "ACTIVE") {
      // Calculate initial time remaining
      const initialRemaining = Math.max(
        0,
        Math.ceil((180000 - (Date.now() - gameStartTime)) / 1000)
      );
      setGameTimeRemaining(initialRemaining);

      // Start new timer
      const timer = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(
          0,
          Math.ceil((180000 - (now - gameStartTime)) / 1000)
        );

        // Only update if the time has actually changed
        setGameTimeRemaining((prev) => {
          if (prev === remaining) return prev;

          // Check for game timeout
          if (remaining <= 0 && evmWallet?.address) {
            clearInterval(timer);
            gameActions.forfeitGame(ForfeitGameReason.TIMEOUT, {
              onSuccess: () => console.log("Game forfeited due to timeout"),
            });
          }

          return remaining;
        });
      }, 1000);

      // Cleanup on unmount or when gameStartedAt changes
      return () => clearInterval(timer);
    }
  }, [
    gameStateLocal.gameStartedAt,
    gameStateLocal.gameStatus,
    evmWallet?.address,
    gameActions,
  ]);

  // Timer resets are no longer needed since effects handle everything

  // Setup WebSocket connection
  const { isConnected, on, off, connectionError } = useGameWebSocket(
    params?.sessionId as string
  );

  // Effect to sync remote game state with local state
  useEffect(() => {
    if (gameState.gameSessionInfo) {
      setGameStateLocal((prev) => {
        const newState = {
          ...prev, // Start with all existing state
          sessionId: gameState?.gameSessionInfo?.sessionId || prev.sessionId,
          gameStatus: gameState?.gameSessionInfo?.status || prev.gameStatus,
          players: gameState?.gameSessionInfo?.players || prev.players,
          currentTurn:
            gameState.gameSessionInfo?.currentTurn || prev.currentTurn,
          gameStartedAt:
            gameState.gameSessionInfo?.turnStartedAt || prev.gameStartedAt,
          turnStartedAt:
            gameState.gameSessionInfo?.turnStartedAt || prev.turnStartedAt,
          // Explicitly preserve these properties
          playerBoard: prev.playerBoard,
          enemyBoard: prev.enemyBoard,
          ships: prev.ships,
          sunkEnemyShips: prev.sunkEnemyShips,
          playerStats: prev.playerStats,
          finalState: prev.finalState,
        };
        console.log("Updating game state:", { before: prev, after: newState });
        return newState;
      });

      // Timer updates are handled by effects now
    }
  }, [gameState.gameSessionInfo]);

  // Initial fetch of game state
  useEffect(() => {
    if (params.sessionId) {
      gameActions.fetchGameSessionInformation(params?.sessionId as string);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.sessionId]);

  // WebSocket connection setup
  useEffect(() => {
    // 📥 DEBUG: log every incoming message
    on.message("*", (data) => {
      console.debug("🔴 WS raw message:", data);
    });

    // Handler for initial session state
    const handleSessionState = (data: any) => {
      console.log("Session state received:", data);

      // Update game state while preserving all properties
      setGameStateLocal((prev) => ({
        ...prev, // Preserve ALL existing state properties
        sessionId: data.sessionId || prev.sessionId,
        gameStatus: data.status || prev.gameStatus,
        players: data.players || prev.players,
        currentTurn: data.currentTurn || prev.currentTurn,
        gameStartedAt: data.gameStartedAt || prev.gameStartedAt,
        turnStartedAt: data.turnStartedAt || prev.turnStartedAt,
        playerBoard: prev.playerBoard,
        enemyBoard: prev.enemyBoard,
        ships: prev.ships,
        statistics: prev.playerStats,
        sunkEnemyShips: prev.sunkEnemyShips,
      }));

      // Timer updates are handled by effects
    };

    // Handler for player joined event
    const handlePlayerJoined = (data: any) => {
      console.log("Player joined:", data);

      setGameStateLocal((prev) => ({
        ...prev,
        players: data.players || prev.players,
        gameStatus: data.status || prev.gameStatus,
      }));

      // Could also play a sound or show a notification here
      // playSound("join") // if we had this sound effect
    };

    // Handler for board submitted event
    const handleBoardSubmitted = (data: BoardSubmittedMessage) => {
      console.log("Board submitted:", data);

      setGameStateLocal((prev) => ({
        ...prev,
        gameStatus: data.gameStatus,
        players: data.players || prev.players,
        currentTurn: data.currentTurn || prev.currentTurn,
        gameStartedAt: data.gameStartedAt || prev.gameStartedAt,
        turnStartedAt: data.turnStartedAt || prev.turnStartedAt,
        // Preserve these important properties if they exist in prev state
        playerBoard: prev.playerBoard,
        enemyBoard: prev.enemyBoard,
        ships: prev.ships,
        sunkEnemyShips: prev.sunkEnemyShips,
        playerStats: prev.playerStats,
      }));

      if (!data.allBoardsSubmitted && data.player === evmWallet?.address) {
        setGeneralMessage({ key: "waiting", id: Date.now() });
      }
    };

    // Handler for game started event
    const handleGameStarted = (data: any) => {
      console.log("Game started:", data);

      setGameStateLocal((prev) => ({
        ...prev,
        gameStatus: "ACTIVE",
        currentTurn: data.currentTurn,
        turnStartedAt: data.turnStartedAt,
        gameStartedAt: data.turnStartedAt, // Use this for game timer
      }));
      setTurnTimeRemaining(15); // Reset turn timer
      setGameTimeRemaining(180); // Reset game timer
      setGeneralMessage({ key: "game-start", id: Date.now() });
    };

    // Handler for shot fired event (handles all shot updates)
    const handleShotFired = (data: any) => {
      console.log("Shot fired:", data);
      const { x, y, player, isHit, nextTurn, turnStartedAt, sunkShips, sunk } =
        data;

      if (!evmWallet?.address) return;

      setGameStateLocal((prev) => {
        // If I'm the shooter, update enemy board
        if (player === evmWallet.address) {
          const newEnemyBoard = prev.enemyBoard.map((row) => [...row]);
          newEnemyBoard[y][x] = isHit ? 2 : 1; // 2 for hit, 1 for miss

          const opponentAddress =
            prev.players.find((p) => p !== evmWallet.address) || "";

          // Update the player's stats in real-time
          const currentStats = prev.playerStats?.[evmWallet.address] || {
            address: evmWallet.address,
            shotsCount: 0,
            hitsCount: 0,
            accuracy: 0,
            shipsSunk: 0,
            avgTurnTime: 0,
          };

          return {
            ...prev,
            enemyBoard: newEnemyBoard,
            currentTurn: nextTurn,
            turnStartedAt: turnStartedAt,
            playerStats: {
              ...prev.playerStats,
              [evmWallet.address]: {
                ...currentStats,
                shotsCount: currentStats.shotsCount + 1,
                hitsCount: currentStats.hitsCount + (isHit ? 1 : 0),
                accuracy: Math.round(
                  ((currentStats.hitsCount + (isHit ? 1 : 0)) /
                    (currentStats.shotsCount + 1)) *
                    100
                ),
                shipsSunk: sunkShips[evmWallet.address] || 0,
                avgTurnTime: calculateAvgTurnTime(
                  currentStats.avgTurnTime,
                  currentStats.shotsCount,
                  Math.floor((Date.now() - turnStartedAt) / 1000)
                ),
              },
            },
          };
        }
        // If I'm being shot at, update my board
        else {
          const newPlayerBoard = prev.playerBoard.map((row) => [...row]);
          newPlayerBoard[y][x] = isHit ? -2 : -1; // -2 for hit, -1 for miss

          const opponentAddress =
            prev.players.find((p) => p !== evmWallet.address) || "";

          // Update opponent's stats in real-time
          const opponentStats = prev.playerStats?.[opponentAddress] || {
            address: opponentAddress,
            shotsCount: 0,
            hitsCount: 0,
            accuracy: 0,
            shipsSunk: 0,
            avgTurnTime: 0,
          };

          return {
            ...prev,
            playerBoard: newPlayerBoard,
            currentTurn: nextTurn,
            turnStartedAt: turnStartedAt,
            playerStats: {
              ...prev.playerStats,
              [opponentAddress]: {
                ...opponentStats,
                shotsCount: opponentStats.shotsCount + 1,
                hitsCount: opponentStats.hitsCount + (isHit ? 1 : 0),
                accuracy: Math.round(
                  ((opponentStats.hitsCount + (isHit ? 1 : 0)) /
                    (opponentStats.shotsCount + 1)) *
                    100
                ),
                shipsSunk: sunkShips[opponentAddress] || 0,
                avgTurnTime: calculateAvgTurnTime(
                  opponentStats.avgTurnTime,
                  opponentStats.shotsCount,
                  Math.floor((Date.now() - turnStartedAt) / 1000)
                ),
              },
            },
          };
        }
      });

      // Play appropriate sound
      playSound(isHit ? "hit" : "miss");

      // Set general message for shot events
      if (player === evmWallet?.address) {
        if (isHit) {
          setGeneralMessage({ key: "hit", id: Date.now() });
        } else {
          setGeneralMessage({ key: "player-missed", id: Date.now() });
        }
      } else {
        if (isHit) {
          setGeneralMessage({ key: "opponent-hit", id: Date.now() });
        } else {
          setGeneralMessage({ key: "missed", id: Date.now() });
        }
      }
      // Timer updates are handled by effects
    };

    // Handler for turn timeout event
    const handleTurnTimeout = (data: TurnTimeoutMessage) => {
      console.log("Turn timeout:", data);
      const { previousPlayer, nextTurn, turnStartedAt, message } = data;

      // Simply update the game state with the new turn info
      // The useEffect hook monitoring turnStartedAt will handle the timer update
      setGameStateLocal((prev) => ({
        ...prev,
        currentTurn: nextTurn,
        turnStartedAt: turnStartedAt,
      }));

      // TODO: Add a turn change sound effect
      console.log("Turn changed due to timeout:", message);
    };

    // Handler for game over event
    const handleGameOver = (data: any) => {
      console.log("Game over:", data);
      const { winner, finalState } = data;

      // Stop all timers
      clearTimers();

      setGameStateLocal((prev) => {
        // Calculate final stats for each player
        const finalPlayerStats = { ...prev.playerStats };

        // For both players, finalize their stats
        Object.keys(finalPlayerStats).forEach((address) => {
          if (finalPlayerStats[address]) {
            const totalTurnTime =
              (finalState.gameEndedAt - finalState.gameStartedAt) / 1000;
            const averageTurnTime = Math.round(
              totalTurnTime / finalPlayerStats[address].shotsCount
            );

            finalPlayerStats[address] = {
              ...finalPlayerStats[address],
              shipsSunk: finalState.sunkShips[address] || 0,
              // Calculate final accuracy
              accuracy:
                finalPlayerStats[address].shotsCount > 0
                  ? Math.round(
                      (finalPlayerStats[address].hitsCount /
                        finalPlayerStats[address].shotsCount) *
                        100
                    )
                  : 0,
              // Calculate final average turn time
              avgTurnTime: averageTurnTime || 0,
            };
          }
        });

        return {
          ...prev,
          gameStatus: "COMPLETED",
          winner: winner || null,
          finalState,
          playerStats: finalPlayerStats,
        };
      });
    };

    // Handler for ship sunk event
    const handleShipSunk = (data: any) => {
      // Only show 'sunk' message and update sunkEnemyShips if the player made the shot
      if (data.player === evmWallet?.address) {
        setGeneralMessage({
          key: "sunk",
          id: Date.now(),
          shipName: data.ship.name,
        });
        setGameStateLocal((prev) => {
          // Avoid duplicates by ship id
          const alreadySunk = prev.sunkEnemyShips.some(
            (s) => s.id === data.ship.id
          );
          if (alreadySunk) return prev;
          return {
            ...prev,
            sunkEnemyShips: [
              ...prev.sunkEnemyShips,
              {
                id: data.ship.id,
                name: data.ship.name,
                cells: data.ship.cells,
              },
            ],
          };
        });
      }
      // Update hitMap for the sunk ship ONLY if the sunk ship belongs to the local player
      if (data.targetPlayer === evmWallet?.address) {
        setGeneralMessage({
          key: "opponent-sunk",
          id: Date.now(),
          shipName: data.ship.name,
        });
        setGameStateLocal((prev) => ({
          ...prev,
          ships: prev.ships.map((ship) =>
            ship.id === data.ship.id
              ? {
                  ...ship,
                  hitMap: Array(ship.length).fill(true),
                }
              : ship
          ),
        }));
      }
    };

    // Handler for errors
    const handleError = (data: any) => {
      console.log("WebSocket error:", data);
      // TODO: UI update - show error message to user
    };

    // Register all event handlers with proper types
    on.session_state(handleSessionState);
    on.player_joined(handlePlayerJoined);
    on.board_submitted(handleBoardSubmitted);
    on.game_started(handleGameStarted);
    on.shot_fired(handleShotFired);
    on.turn_timeout(handleTurnTimeout);
    on.game_over(handleGameOver);
    on.message("ship_sunk", handleShipSunk);
    on.error(handleError);

    // Cleanup function to remove event handlers
    return () => {
      off.session_state(handleSessionState);
      off.player_joined(handlePlayerJoined);
      off.board_submitted(handleBoardSubmitted);
      off.game_started(handleGameStarted);
      off.shot_fired(handleShotFired);
      off.game_over(handleGameOver);
      off.error(handleError);
      off.turn_timeout(handleTurnTimeout);
      off.message("ship_sunk", handleShipSunk);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, params?.sessionId]);

  const canPlaceShip = (
    cells: { x: number; y: number }[],
    board: number[][]
  ) => {
    for (const cell of cells) {
      if (board[cell.y][cell.x] !== 0) return false;

      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const adjX = cell.x + dx;
          const adjY = cell.y + dy;
          if (adjX >= 0 && adjX < 10 && adjY >= 0 && adjY < 10) {
            if (board[adjY][adjX] !== 0) return false;
          }
        }
      }
    }
    return true;
  };

  const submitBoard = async () => {
    if (!evmWallet?.address || gameStateLocal.ships.length === 0) return;
    setGameStateLocal((prev) => ({
      ...prev,
      gameStatus: "SETUP",
    }));
    // Hide inventory permanently after submission
    try {
      await gameActions.submitBoardCommitment(
        {
          address: evmWallet.address,
          boardCommitment: generateBoardCommitment(),
          ships: gameStateLocal.ships,
        },
        {
          onSuccess: () => setInventoryVisible(false),
        }
      );
    } catch (error) {
      console.error("Error submitting board:", error);
    }
  };

  const generateBoardCommitment = () => {
    // Simplified commitment generation for demo
    const boardString = JSON.stringify(gameStateLocal.ships);
    const salt = Math.random().toString(36).substr(2, 9);
    return (
      "0x" +
      btoa(boardString + salt)
        .replace(/[^a-f0-9]/gi, "")
        .substr(0, 64)
    );
  };

  // New UI State for simplicity
  const mode = gameStateLocal.gameStatus === "ACTIVE" ? "game" : "setup";
  const yourTurn = evmWallet?.address === gameStateLocal.currentTurn;
  const turnStartedAt = gameStateLocal.turnStartedAt ?? undefined;
  const gameCode = gameStateLocal.sessionId ?? undefined;
  const onHam = () => {}; // Placeholder, implement as needed
  const onTurnExpiry = () => {}; // Placeholder, implement as needed

  // State for inventory panel visibility
  const [inventoryVisible, setInventoryVisible] = useState(true);
  const shipsInPosition: Record<string, boolean> = {
    Carrier: !!gameStateLocal.ships.find((s) => s.name === "Carrier"),
    Battleship: !!gameStateLocal.ships.find((s) => s.name === "Battleship"),
    Cruiser: !!gameStateLocal.ships.find((s) => s.name === "Cruiser"),
    Submarine: !!gameStateLocal.ships.find((s) => s.name === "Submarine"),
    Destroyer: !!gameStateLocal.ships.find((s) => s.name === "Destroyer"),
  };

  const shipConfigs = [
    { name: "Carrier", length: 5 },
    { name: "Battleship", length: 4 },
    { name: "Cruiser", length: 3 },
    { name: "Submarine", length: 3 },
    { name: "Destroyer", length: 2 },
  ];

  function findRandomShipPlacement(
    length: number,
    board: number[][]
  ): { x: number; y: number }[] | null {
    for (let attempt = 0; attempt < 1000; attempt++) {
      const isHorizontal = Math.random() > 0.5;
      const startX = Math.floor(
        Math.random() * (10 - (isHorizontal ? length : 1))
      );
      const startY = Math.floor(
        Math.random() * (10 - (isHorizontal ? 1 : length))
      );
      const cells = [];
      for (let j = 0; j < length; j++) {
        if (isHorizontal) {
          cells.push({ x: startX + j, y: startY });
        } else {
          cells.push({ x: startX, y: startY + j });
        }
      }
      if (canPlaceShip(cells, board)) return cells;
    }
    return null;
  }

  const onPlaceShip = (variant: string) => {
    if (gameStateLocal.ships.find((s) => s.name === variant)) return;
    const config = shipConfigs.find((s) => s.name === variant);
    if (!config) return;
    // Copy board
    const board = gameStateLocal.playerBoard.map((row) => [...row]);
    // Place the new ship
    const cells = findRandomShipPlacement(config.length, board);
    if (!cells) return;
    const shipIndex = shipConfigs.findIndex((s) => s.name === variant) + 1;
    cells.forEach((cell) => {
      board[cell.y][cell.x] = shipIndex;
    });
    setGameStateLocal((prev) => ({
      ...prev,
      ships: [
        ...prev.ships,
        {
          id: `ship-${variant}`,
          name: variant,
          length: config.length,
          cells,
        },
      ],
      playerBoard: board,
    }));
    playSound("place");
  };

  const onShuffle = () => {
    const placedShips = gameStateLocal.ships;
    const board = Array(10)
      .fill(0)
      .map(() => Array(10).fill(0));
    const newShips: Ship[] = [];
    for (const ship of placedShips) {
      const cells = findRandomShipPlacement(ship.length, board);
      if (!cells) continue;
      const shipIndex = shipConfigs.findIndex((s) => s.name === ship.name) + 1;
      cells.forEach((cell) => {
        board[cell.y][cell.x] = shipIndex;
      });
      newShips.push({ ...ship, cells });
    }
    setGameStateLocal((prev) => ({
      ...prev,
      ships: newShips,
      playerBoard: board,
    }));
    playSound("place");
  };

  const onReady = () => {
    submitBoard();
  };

  const disableReadyButton =
    Object.values(shipsInPosition).some((placed) => !placed) ||
    gameStateLocal.players.length < 2;

  const selfAddress = evmWallet?.address ?? "";
  const opponentAddress =
    gameStateLocal.players.find((p) => p !== selfAddress) ?? "";

  const hasSelfSubmitted = gameStateLocal.ships.length > 0;
  const hasOpponentSubmitted = false;

  const playerStatus = getPlayerStatus({
    gameStatus: gameStateLocal.gameStatus,
    players: gameStateLocal.players,
    address: selfAddress,
    hasSubmitted: hasSelfSubmitted,
    isSelf: true,
    selfAddress,
    opponentAddress,
  });

  const opponentStatus = getPlayerStatus({
    gameStatus: gameStateLocal.gameStatus,
    players: gameStateLocal.players,
    address: opponentAddress,
    hasSubmitted: hasOpponentSubmitted,
    isSelf: false,
    selfAddress,
    opponentAddress,
  });

  const { infoShow, setUserDismissedInfo } = useToggleInfo();

  const showVictory = gameStateLocal.gameStatus === "COMPLETED";
  const isDraw =
    gameStateLocal.gameStatus === "COMPLETED" && !gameStateLocal.winner;
  const isWinner = gameStateLocal.winner === evmWallet?.address;
  const victoryStatus = isDraw ? "draw" : isWinner ? "win" : "loss";
  const handlePlayAgain = () => navigate.push("/new-game");

  const updateShipPosition = (id: string, pos: { x: number; y: number }) => {
    setGameStateLocal((prev) => ({
      ...prev,
      ships: prev.ships.map((ship) =>
        ship.id === id
          ? {
              ...ship,
              cells: ship.cells.map((cell, idx) => ({
                x: pos.x + (ship.cells[idx].x - ship.cells[0].x),
                y: pos.y + (ship.cells[idx].y - ship.cells[0].y),
              })),
            }
          : ship
      ),
    }));
    playSound("place");
  };

  const flipShip = (id: string) => {
    setGameStateLocal((prev) => ({
      ...prev,
      ships: prev.ships.map((ship) => {
        if (ship.id !== id) return ship;
        // Flip orientation by swapping x/y deltas
        const base = ship.cells[0];
        const isHorizontal =
          ship.cells.length > 1 && ship.cells[0].y === ship.cells[1].y;
        const newCells = ship.cells.map((cell, idx) =>
          isHorizontal
            ? { x: base.x, y: base.y + idx }
            : { x: base.x + idx, y: base.y }
        );
        return { ...ship, cells: newCells };
      }),
    }));
    playSound("place");
  };

  const [overlaps, setOverlaps] = useState<{ x: number; y: number }[]>([]);
  const handleOverlap = useCallback(
    (overlapCells: { x: number; y: number }[]) => {
      // Only update overlaps if the value actually changes (shallow compare)
      if (
        overlaps.length === overlapCells.length &&
        overlaps.every(
          (cell, idx) =>
            cell.x === overlapCells[idx].x && cell.y === overlapCells[idx].y
        )
      ) {
        return;
      }
      setOverlaps(overlapCells);
    },
    [overlaps]
  );

  const [modeState, setModeState] = useState<"setup" | "game">(
    mode as "setup" | "game"
  );
  const setMode = (newMode: "setup" | "game") => setModeState(newMode);

  // --- Board/ShipType adapters ---
  const allowedVariants = [
    "Carrier",
    "Battleship",
    "Cruiser",
    "Submarine",
    "Destroyer",
  ] as const;
  type Variant = (typeof allowedVariants)[number];

  function getOrientation(
    cells: { x: number; y: number }[]
  ): "horizontal" | "vertical" {
    if (cells.length < 2) return "horizontal";
    return cells[0].y === cells[1].y ? "horizontal" : "vertical";
  }

  function boardArrayToRecord(
    board: number[][],
    isPlayer: boolean = false
  ): Record<string, "ship" | "hit" | "miss" | null> {
    const result: Record<string, "ship" | "hit" | "miss" | null> = {};
    for (let y = 0; y < board.length; y++) {
      for (let x = 0; x < board[y].length; x++) {
        const val = board[y][x];
        const key = `${x}-${y}`;
        if (isPlayer) {
          if (val > 0) result[key] = "ship";
          else if (val === -2) result[key] = "hit";
          else if (val === -1) result[key] = "miss";
          else result[key] = null;
        } else {
          if (val === 2) result[key] = "hit";
          else if (val === 1) result[key] = "miss";
          else result[key] = null;
        }
      }
    }
    return result;
  }

  const playerBoard = boardArrayToRecord(gameStateLocal.playerBoard, true);
  // For opponentBoard, filter out 'ship' values to match expected type
  const rawOpponentBoard = boardArrayToRecord(gameStateLocal.enemyBoard, false);
  const opponentBoard: Record<string, "hit" | "miss" | null> = {};
  Object.entries(rawOpponentBoard).forEach(([k, v]) => {
    opponentBoard[k] = v === "hit" || v === "miss" ? v : null;
  });

  const currentTurn =
    gameStateLocal.currentTurn && evmWallet?.address
      ? {
          playerId: gameStateLocal.currentTurn,
          isMyTurn: gameStateLocal.currentTurn === evmWallet.address,
        }
      : null;

  // --- PLAYER SHIPS: update hitMap based on playerBoard ---
  const placedShips = gameStateLocal.ships
    .filter((ship) => allowedVariants.includes(ship.name as Variant))
    .map((ship) => {
      const orientation = getOrientation(ship.cells);
      const position = ship.cells[0];
      // Build hitMap from playerBoard
      const hitMap = ship.cells.map((cell) => {
        const val = gameStateLocal.playerBoard[cell.y][cell.x];
        return val === -2; // -2 means hit
      });
      return {
        id: ship.id,
        variant: ship.name as Variant,
        orientation,
        position,
        hitMap,
      };
    });

  // --- OPPONENT SHIPS: show sunk enemy ships with all hitMap true ---
  const opponentShips = gameStateLocal.sunkEnemyShips.map((ship) => {
    const orientation = getOrientation(ship.cells);
    const position = ship.cells[0];
    return {
      id: ship.id,
      variant: ship.name as Variant,
      orientation,
      position,
      hitMap: Array(ship.cells.length).fill(true),
    };
  });

  return (
    <div className="relative flex items-center justify-center flex-1">
      <LoadingOverlay loading={!loadingDone} loadingMessages={messages} />

      {loadingDone && (
        <motion.div
          key="game"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full h-full flex flex-col items-center justify-center"
        >
          {connectionError && (
            <div className="absolute top-0 w-full bg-red-500 text-white p-2 text-center">
              {connectionError}
            </div>
          )}

          <GameHeader
            mode={mode}
            yourTurn={yourTurn}
            turnStartedAt={turnStartedAt}
            gameCode={gameCode}
            onTurnExpiry={onTurnExpiry}
            gameTimeRemaining={gameTimeRemaining}
          />

          <SetupPanel
            inventoryVisible={inventoryVisible}
            setInventoryVisible={() => setInventoryVisible(false)}
            shipsInPosition={shipsInPosition}
            onPlaceShip={onPlaceShip}
            onShuffle={onShuffle}
            onReady={onReady}
            disableReadyButton={disableReadyButton}
            mode={mode}
            waitingForOpponent={gameStateLocal.players.length < 2}
          />

          <GameBoardContainer
            placedShips={placedShips}
            updateShipPosition={updateShipPosition}
            flipShip={flipShip}
            handleOverlap={handleOverlap}
            mode={mode}
            currentTurn={currentTurn}
            opponentBoard={opponentBoard}
            playerBoard={playerBoard}
            handleShoot={makeShot}
            generalMessage={generalMessage}
            disableReadyButton={disableReadyButton}
            inventoryVisible={inventoryVisible}
            setMode={setMode}
            onReady={onReady}
            onFireShot={makeShot}
            waitingForOpponent={gameStateLocal.players.length < 2}
            {...(mode === "game" && { opponentShips })}
          />

          <GameFooter
            overlaps={overlaps}
            infoShow={infoShow}
            setUserDismissedInfo={setUserDismissedInfo}
            generalMessage={generalMessage}
            playerAddress={selfAddress}
            opponentAddress={opponentAddress}
            playerStatus={playerStatus}
            opponentStatus={opponentStatus}
            mode={mode}
          />
        </motion.div>
      )}

      <VictoryStatus
        show={showVictory}
        status={victoryStatus}
        onPlayAgain={handlePlayAgain}
        onHome={handlePlayAgain}
        playerStats={
          gameStateLocal.playerStats?.[evmWallet?.address || ""] || {
            address: evmWallet?.address || "",
            shotsCount: 0,
            hitsCount: 0,
            accuracy: 0,
            shipsSunk: 0,
            avgTurnTime: 0,
          }
        }
      />
    </div>
  );
};

export default GameSession;
