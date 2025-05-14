"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import useGameActions from "@/store/game/actions";
import useSystemFunctions from "@/hooks/useSystemFunctions";
import useGameWebSocket, { TurnTimeoutMessage } from "@/hooks/useGameWebSocket";
import usePrivyLinkedAccounts from "@/hooks/usePrivyLinkedAccounts";
import { useParams } from "next/navigation";

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
  statistics: {
    yourShots: number;
    yourHits: number;
    yourSunk: number;
    enemyShots: number;
    enemyHits: number;
    enemySunk: number;
  };
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

const GameSession = () => {
  const params = useParams();
  const { evmWallet } = usePrivyLinkedAccounts();
  const { gameState } = useSystemFunctions();
  const gameActions = useGameActions();
  const [turnTimer, setTurnTimer] = useState<NodeJS.Timeout | null>(null);
  const [gameTimer, setGameTimer] = useState<NodeJS.Timeout | null>(null);

  // Initialize game state
  const [gameStateLocal, setGameStateLocal] = useState<GameState>({
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
    statistics: {
      yourShots: 0,
      yourHits: 0,
      yourSunk: 0,
      enemyShots: 0,
      enemyHits: 0,
      enemySunk: 0,
    },
  });

  const [turnTimeRemaining, setTurnTimeRemaining] = useState(15);
  const [gameTimeRemaining, setGameTimeRemaining] = useState(180);

  // Audio refs
  const hitSoundRef = useRef<HTMLAudioElement | null>(null);
  const missSoundRef = useRef<HTMLAudioElement | null>(null);
  const placementSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio elements
    hitSoundRef.current = new Audio("/sounds/hit.mp3");
    missSoundRef.current = new Audio("/sounds/miss.mp3");
    placementSoundRef.current = new Audio("/sounds/place.mp3");

    // Set volume
    if (hitSoundRef.current) hitSoundRef.current.volume = 0.5;
    if (missSoundRef.current) missSoundRef.current.volume = 0.5;
    if (placementSoundRef.current) placementSoundRef.current.volume = 0.5;

    // Cleanup
    return () => {
      if (hitSoundRef.current) hitSoundRef.current = null;
      if (missSoundRef.current) missSoundRef.current = null;
      if (placementSoundRef.current) placementSoundRef.current = null;
    };
  }, []);

  // Play sound effects
  const playSound = useCallback((type: "hit" | "miss" | "place") => {
    const sound =
      type === "hit"
        ? hitSoundRef.current
        : type === "miss"
        ? missSoundRef.current
        : placementSoundRef.current;

    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(console.error);
    }
  }, []);

  // Game functions
  const makeShot = async (x: number, y: number) => {
    if (!evmWallet?.address || gameStateLocal.currentTurn !== evmWallet.address)
      return;
    if (gameStateLocal.enemyBoard[y][x] !== 0) return;

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

  const resetTurnTimer = useCallback(
    (startTime: number) => {
      if (turnTimer) clearInterval(turnTimer);

      const timer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 15000 - elapsed); // 15 seconds turn timeout
        setTurnTimeRemaining(Math.ceil(remaining / 1000));

        if (remaining <= 0) {
          clearInterval(timer);
          // Auto-submit random shot if it's our turn
          if (gameStateLocal.currentTurn === evmWallet?.address) {
            console.log("Turn timeout - auto submitting random shot");
            // Find available cells
            const availableCells: [number, number][] = [];
            gameStateLocal.enemyBoard.forEach((row, y) => {
              row.forEach((cell, x) => {
                if (cell === 0) availableCells.push([x, y]);
              });
            });

            if (availableCells.length > 0) {
              const [x, y] =
                availableCells[
                  Math.floor(Math.random() * availableCells.length)
                ];
              makeShot(x, y);
            }
          }
        }
      }, 1000);

      setTurnTimer(timer);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      turnTimer,
      gameStateLocal.currentTurn,
      evmWallet?.address,
      gameStateLocal.enemyBoard,
    ]
  );

  const resetGameTimer = useCallback(
    (startTime: number) => {
      if (gameTimer) clearInterval(gameTimer);

      const timer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 180000 - elapsed); // 3 minutes
        if (remaining <= 0) {
          clearInterval(timer);
          // Handle game timeout
        }
      }, 1000);

      setGameTimer(timer);
    },
    [gameTimer]
  );

  const startTimers = useCallback(
    (startTime: number) => {
      clearTimers();
      resetTurnTimer(startTime);
      resetGameTimer(startTime);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Setup WebSocket connection
  const { isConnected, on, off } = useGameWebSocket(
    params?.sessionId as string
  );

  // Effect to sync remote game state with local state
  useEffect(() => {
    if (gameState.gameSessionInfo) {
      setGameStateLocal((prev) => {
        // Create new state while explicitly preserving all local properties
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
          statistics: prev.statistics,
        };
        console.log("Updating game state:", { before: prev, after: newState });
        return newState;
      });

      // If game is active, start timers
      if (
        gameState.gameSessionInfo.turnStartedAt &&
        gameState.gameSessionInfo.status === "ACTIVE"
      ) {
        startTimers(gameState.gameSessionInfo.turnStartedAt);
      }
    }
  }, [gameState.gameSessionInfo, startTimers]);

  // Initial fetch of game state
  useEffect(() => {
    if (params.sessionId) {
      gameActions.fetchGameSessionInformation(params?.sessionId as string);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.sessionId]);

  const handleGameOver = useCallback(
    (data: any) => {
      clearTimers();
      const { winner, reason } = data;
      const isWinner = winner === evmWallet?.address;

      setGameStateLocal((prev) => ({
        ...prev,
        gameStatus: "COMPLETED",
      }));

      // Show game over overlay
      return (
        <div
          className={`fixed inset-0 flex items-center justify-center bg-black/50 z-50 ${
            gameStateLocal.gameStatus === "COMPLETED"
              ? "opacity-100"
              : "opacity-0 pointer-events-none"
          } transition-opacity duration-500`}
        >
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 transform transition-transform duration-500 scale-100">
            <h2 className="text-2xl font-bold mb-4 text-center">Game Over!</h2>
            <div className="text-center mb-6">
              <div
                className={`text-xl font-semibold mb-2 ${
                  isWinner ? "text-green-600" : "text-red-600"
                }`}
              >
                {isWinner ? "Victory!" : "Defeat!"}
              </div>
              <p className="text-gray-600">{reason}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center mb-6">
              <div>
                <div className="text-lg font-semibold">Your Stats</div>
                <div>Shots: {gameStateLocal.statistics.yourShots}</div>
                <div>Hits: {gameStateLocal.statistics.yourHits}</div>
                <div>Ships Sunk: {gameStateLocal.statistics.yourSunk}</div>
              </div>
              <div>
                <div className="text-lg font-semibold">Enemy Stats</div>
                <div>Shots: {gameStateLocal.statistics.enemyShots}</div>
                <div>Hits: {gameStateLocal.statistics.enemyHits}</div>
                <div>Ships Sunk: {gameStateLocal.statistics.enemySunk}</div>
              </div>
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => (window.location.href = "/")}
                className="bg-[#1a73e8] text-white px-6 py-2 rounded hover:bg-[#1557b0] transition-colors"
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [evmWallet?.address, gameStateLocal.statistics, gameStateLocal.gameStatus]
  );

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
        // Preserve these important properties if they exist in prev state
        playerBoard: prev.playerBoard,
        enemyBoard: prev.enemyBoard,
        ships: prev.ships,
        statistics: prev.statistics,
      }));

      // Handle status-specific logic
      if (data.status === "ACTIVE" && data.turnStartedAt) {
        startTimers(data.turnStartedAt);
      }
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
    const handleBoardSubmitted = (data: any) => {
      console.log("Board submitted:", data);

      // if (data.player === gamePlayerId) {
      //   setPlayerStatus("READY");
      // } else {
      //   setOpponentStatus("READY");
      // }

      // if (data.allBoardsSubmitted) {
      //   setMode("game");
      //   setGeneralMessageKey("game-start");

      //   if (isConnected) {
      //     send({ type: "game_started_ack", sessionId });
      //   }
      // }
    };

    // Handler for game started event
    const handleGameStarted = (data: any) => {
      console.log("Game started:", data);

      setGameStateLocal((prev) => ({
        ...prev,
        gameStatus: "ACTIVE",
        currentTurn: data.currentTurn,
        turnStartedAt: data.turnStartedAt,
        gameStartedAt: data.turnStartedAt,
      }));

      if (data.turnStartedAt) {
        startTimers(data.turnStartedAt);
      }
    };

    // Handler for shot fired event (opponent attacks you)
    const handleShotFired = (data: any) => {
      console.log("Shot fired at you:", data);
      const { x, y, player } = data;

      setGameStateLocal((prev) => {
        // Deep clone the player board
        const newPlayerBoard = prev.playerBoard.map((row) => [...row]);
        // Check if it was a hit
        const wasHit = newPlayerBoard[y][x] > 0;
        // Mark the cell
        newPlayerBoard[y][x] = wasHit ? -2 : -1; // -2 for hit, -1 for miss

        const newState = {
          ...prev,
          playerBoard: newPlayerBoard,
          statistics: {
            ...prev.statistics,
            enemyShots: prev.statistics.enemyShots + 1,
            enemyHits: prev.statistics.enemyHits + (wasHit ? 1 : 0),
          },
        };

        // Play appropriate sound after state update
        setTimeout(() => playSound(wasHit ? "hit" : "miss"), 0);

        return newState;
      });
    };

    // Handler for turn timeout event
    const handleTurnTimeout = (data: TurnTimeoutMessage) => {
      console.log("Turn timeout:", data);

      // TODO: UI update - show turn timeout message
    };

    // Handler for shot result event (response to your attack)
    const handleShotResult = (data: any) => {
      console.log("Shot result received:", data);
      const { x, y, isHit, nextTurn, turnStartedAt } = data;

      setGameStateLocal((prev) => {
        // Deep clone the enemy board
        const newEnemyBoard = prev.enemyBoard.map((row) => [...row]);
        // Mark the cell
        newEnemyBoard[y][x] = isHit ? 2 : 1; // 2 for hit, 1 for miss

        return {
          ...prev,
          enemyBoard: newEnemyBoard,
          currentTurn: nextTurn,
          turnStartedAt: turnStartedAt,
          statistics: {
            ...prev.statistics,
            yourShots: prev.statistics.yourShots + 1,
            yourHits: prev.statistics.yourHits + (isHit ? 1 : 0),
          },
        };
      });

      // Play appropriate sound and start new turn timer
      playSound(isHit ? "hit" : "miss");
      if (turnStartedAt) {
        resetTurnTimer(turnStartedAt);
      }
    };

    // Handler for game over event
    const handleGameOver = (data: any) => {
      console.log("Game over:", data);

      // Game has ended, determine if I won
      // const playerWon = data.winner === gamePlayerId;

      // Update victory/defeat state
      // setIsWinner(playerWon);
      // setShowVictory(true);

      // TODO: UI update - show victory or defeat screen
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
    on.shot_result(handleShotResult);
    on.turn_timeout(handleTurnTimeout);
    on.game_over(handleGameOver);
    on.error(handleError);

    // Cleanup function to remove event handlers
    return () => {
      off.session_state(handleSessionState);
      off.player_joined(handlePlayerJoined);
      off.board_submitted(handleBoardSubmitted);
      off.game_started(handleGameStarted);
      off.shot_fired(handleShotFired);
      off.shot_result(handleShotResult);
      off.game_over(handleGameOver);
      off.error(handleError);
      off.turn_timeout(handleTurnTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, params?.sessionId]);

  const generateRandomShipPlacement = () => {
    const ships: Ship[] = [];
    const shipLengths = [5, 4, 3, 3, 2];
    const shipNames = [
      "Carrier",
      "Battleship",
      "Cruiser",
      "Submarine",
      "Destroyer",
    ];
    const newBoard = Array(10)
      .fill(0)
      .map(() => Array(10).fill(0));

    for (let i = 0; i < shipLengths.length; i++) {
      let placed = false;
      let attempts = 0;

      while (!placed && attempts < 1000) {
        const isHorizontal = Math.random() > 0.5;
        const startX = Math.floor(
          Math.random() * (10 - (isHorizontal ? shipLengths[i] : 1))
        );
        const startY = Math.floor(
          Math.random() * (10 - (isHorizontal ? 1 : shipLengths[i]))
        );

        const cells = [];
        for (let j = 0; j < shipLengths[i]; j++) {
          if (isHorizontal) {
            cells.push({ x: startX + j, y: startY });
          } else {
            cells.push({ x: startX, y: startY + j });
          }
        }

        if (canPlaceShip(cells, newBoard)) {
          cells.forEach((cell) => {
            newBoard[cell.y][cell.x] = i + 1;
          });

          ships.push({
            id: `ship-${i}`,
            name: shipNames[i],
            length: shipLengths[i],
            cells: cells,
          });
          placed = true;
          playSound("place");
        }
        attempts++;
      }

      if (!placed) {
        throw new Error(`Failed to place ship ${shipNames[i]}`);
      }
    }

    setGameStateLocal((prev) => ({
      ...prev,
      ships: ships,
      playerBoard: newBoard,
    }));
  };

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

    try {
      await gameActions.submitBoardCommitment({
        address: evmWallet.address,
        boardCommitment: generateBoardCommitment(),
        ships: gameStateLocal.ships,
      });
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

  console.log("gameStateLocal", gameStateLocal);

  return (
    <div className="max-w-[1400px] mx-auto">
      <style jsx global>{`
        @keyframes placed {
          0% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes hit {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.2);
            background-color: #dc3545;
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes miss {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.2);
            background-color: #6c757d;
          }
          100% {
            transform: scale(1);
          }
        }

        .cell-ship-placed {
          animation: placed 0.5s ease-out;
        }

        .cell-hit {
          animation: hit 0.5s ease-out;
        }

        .cell-miss {
          animation: miss 0.5s ease-out;
        }
      `}</style>

      <h1 className="text-[#1a73e8] mt-0 mb-4">🚢 ZK Battleship</h1>

      {/* Connection Status */}
      <div className="bg-white rounded-lg shadow p-5 mb-5">
        <h2 className="text-[#1a73e8] mt-0 mb-4">Connection Status</h2>
        <div className="flex gap-2.5 mb-2.5">
          <div
            className={`px-2.5 py-1.5 rounded text-xs font-medium ${
              isConnected
                ? "bg-[#d4edda] text-[#155724]"
                : "bg-[#f8d7da] text-[#721c24]"
            }`}
          >
            WebSocket: {isConnected ? "Connected" : "Disconnected"}
          </div>
          <div
            className={`px-2.5 py-1.5 rounded text-xs font-medium ${
              gameStateLocal.gameStatus !== "CREATED"
                ? "bg-[#d4edda] text-[#155724]"
                : "bg-[#f8d7da] text-[#721c24]"
            }`}
          >
            Game:{" "}
            {gameStateLocal.gameStatus !== "CREATED"
              ? "Connected"
              : "Not Started"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 mb-5">
        {/* Game Setup */}
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-[#1a73e8] mt-0 mb-4">Game Setup</h2>

          <div className="mb-5 pb-[15px] border-b border-[#eee]">
            <h3 className="text-[#1a73e8] mt-0 mb-4">Session Info</h3>
            <div className="bg-[#f8f9fa] border border-[#dee2e6] rounded p-[15px] my-2.5 text-black">
              <div>
                <strong>Session ID:</strong> {gameStateLocal.sessionId}
              </div>
              <div>
                <strong>Players:</strong> {gameStateLocal?.players?.join(", ")}
              </div>
              <div>
                <strong>Game Status:</strong>{" "}
                <span
                  className={`inline-block px-2.5 py-1.5 rounded font-medium my-1.5 ${
                    gameStateLocal.gameStatus === "CREATED"
                      ? "bg-[#fff3cd] text-[#856404] border border-[#ffeaa7]"
                      : gameStateLocal.gameStatus === "ACTIVE"
                      ? "bg-[#d4edda] text-[#155724] border border-[#c3e6cb]"
                      : gameStateLocal.gameStatus === "COMPLETED"
                      ? "bg-[#d1ecf1] text-[#0c5460] border border-[#bee5eb]"
                      : ""
                  }`}
                >
                  {gameStateLocal.gameStatus}
                </span>
              </div>
              <div>
                <strong>Current Turn:</strong> {gameStateLocal?.currentTurn}
              </div>
            </div>
          </div>

          <div className="mb-5 pb-[15px] border-b border-[#eee]">
            <h3 className="text-[#1a73e8] mt-0 mb-4">Setup Board</h3>
            <div className="grid grid-cols-5 gap-2.5 my-2.5">
              {[
                "Carrier",
                "Battleship",
                "Cruiser",
                "Submarine",
                "Destroyer",
              ].map((ship, index) => (
                <div
                  key={ship}
                  className={`bg-[#e9ecef] p-2 rounded text-center text-xs ${
                    gameStateLocal.ships.some((s) => s.name === ship)
                      ? "bg-[#d4edda] text-[#155724]"
                      : ""
                  }`}
                >
                  <div>{ship}</div>
                  <div>Length: {[5, 4, 3, 3, 2][index]}</div>
                </div>
              ))}
            </div>
            <button
              onClick={generateRandomShipPlacement}
              className="bg-[#1a73e8] text-white border-none px-4 py-2 rounded cursor-pointer text-sm mr-2.5 transition-colors hover:bg-[#0d62c9]"
            >
              Randomize Ships
            </button>
            <button
              onClick={submitBoard}
              className="bg-[#28a745] text-white border-none px-4 py-2 rounded cursor-pointer text-sm transition-colors hover:bg-[#218838]"
            >
              Submit Board
            </button>
          </div>
        </div>

        {/* Game Board & Controls */}
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-[#1a73e8] mt-0 mb-4">Game Board</h2>

          <div className="mb-5 pb-[15px] border-b border-[#eee]">
            <h3 className="text-[#1a73e8] mt-0 mb-4">Your Board</h3>
            <div className="grid grid-cols-10 gap-[2px] max-w-[300px] my-5">
              {gameStateLocal.playerBoard.map((row, y) =>
                row.map((cell, x) => (
                  <div
                    key={`player-${x}-${y}`}
                    className={`aspect-square border border-[#ccc] bg-[#f0f0f0] cursor-pointer flex items-center justify-center text-xs transition-colors hover:bg-[#e0e0e0] ${
                      cell > 0 ? "bg-[#007bff] text-white cell-ship-placed" : ""
                    } ${
                      cell === -2 ? "bg-[#dc3545] text-white cell-hit" : ""
                    } ${
                      cell === -1 ? "bg-[#6c757d] text-white cell-miss" : ""
                    }`}
                  >
                    {cell > 0 && "S"}
                    {cell === -2 && "H"}
                    {cell === -1 && "M"}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mb-5 pb-[15px] border-b border-[#eee]">
            <h3 className="text-[#1a73e8] mt-0 mb-4">Enemy Board</h3>
            <div className="grid grid-cols-10 gap-[2px] max-w-[300px] my-5">
              {gameStateLocal.enemyBoard.map((row, y) =>
                row.map((cell, x) => (
                  <div
                    key={`enemy-${x}-${y}`}
                    onClick={() => makeShot(x, y)}
                    className={`aspect-square border border-[#ccc] bg-[#f0f0f0] cursor-pointer flex items-center justify-center text-xs transition-colors hover:bg-[#e0e0e0] ${
                      cell === 2 ? "bg-[#dc3545] text-white cell-hit" : ""
                    } ${cell === 1 ? "bg-[#6c757d] text-white cell-miss" : ""}`}
                  >
                    {cell === 2 ? "H" : cell === 1 ? "M" : ""}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mb-5">
            <h3 className="text-[#1a73e8] mt-0 mb-4">Game Timers</h3>
            <div className="bg-[#f8f9fa] p-2.5 rounded border border-[#dee2e6]">
              <h4 className="m-0 mb-2.5 text-[#495057]">Turn Timer</h4>
              <div
                className={`text-lg font-bold p-2.5 rounded text-center ${
                  gameStateLocal.turnStartedAt
                    ? "bg-[#fff3cd] text-[#856404]"
                    : "bg-[#f8f9fa]"
                }`}
              >
                {turnTimeRemaining}s
              </div>
            </div>
            <div className="bg-[#f8f9fa] p-2.5 rounded border border-[#dee2e6] mt-2.5">
              <h4 className="m-0 mb-2.5 text-[#495057]">Game Timer</h4>
              <div
                className={`text-lg font-bold p-2.5 rounded text-center ${
                  gameStateLocal.gameStartedAt
                    ? "bg-[#fff3cd] text-[#856404]"
                    : "bg-[#f8f9fa]"
                }`}
              >
                {formatTime(gameTimeRemaining)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Game Information */}
      <div className="bg-white rounded-lg shadow p-5">
        <h2 className="text-[#1a73e8] mt-0 mb-4">Game Information</h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2.5 my-[15px]">
          <div className="bg-[#f8f9fa] p-2.5 rounded border border-[#dee2e6]">
            <h4 className="m-0 mb-2.5 text-[#495057]">Your Stats</h4>
            <div>Shots Fired: {gameStateLocal.statistics.yourShots}</div>
            <div>Hits: {gameStateLocal.statistics.yourHits}</div>
            <div>Ships Sunk: {gameStateLocal.statistics.yourSunk}</div>
            <div>
              Accuracy:{" "}
              {gameStateLocal.statistics.yourShots > 0
                ? Math.round(
                    (gameStateLocal.statistics.yourHits /
                      gameStateLocal.statistics.yourShots) *
                      100
                  )
                : 0}
              %
            </div>
          </div>
          <div className="bg-[#f8f9fa] p-2.5 rounded border border-[#dee2e6]">
            <h4 className="m-0 mb-2.5 text-[#495057]">Enemy Stats</h4>
            <div>Shots Received: {gameStateLocal.statistics.enemyShots}</div>
            <div>Hits Taken: {gameStateLocal.statistics.enemyHits}</div>
            <div>Your Ships Sunk: {gameStateLocal.statistics.enemySunk}</div>
          </div>
        </div>
      </div>

      {/* Render game over screen when game is completed */}
      {gameStateLocal.gameStatus === "COMPLETED" && handleGameOver({})}
    </div>
  );
};

export default GameSession;
