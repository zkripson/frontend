"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";

import { useLoadingSequence } from "@/hooks/useLoadingSequence";
import { useToggleInfo } from "@/hooks/useToggleInfo";
import { isValidPlacement } from "@/utils/shipPlacement";
import { GRID_SIZE, SHIP_LENGTHS } from "@/constants/gameConfig";
import { LoadingOverlay } from "./components/LoadingOverlay";
import { GameHeader } from "./components/GameHeader";
import { SetupPanel } from "./components/SetupPanel";
import { GameBoardContainer } from "./components/GameBoardContainer";
import { GameFooter } from "./components/GameFooter";
import { GeneralMessageKey } from "./components/general";
import VictoryStatus from "./components/VictoryStatus";
import useGameWebSocket, {
  BoardSubmittedMessage,
  ErrorMessage,
  GameOverMessage,
  GameStartedMessage,
  PlayerJoinedMessage,
  SessionStateMessage,
  ShotFiredMessage,
  ShotResultMessage,
} from "@/hooks/useGameWebSocket";
import useSystemFunctions from "@/hooks/useSystemFunctions";
import useGameActions from "@/store/game/actions";
import usePrivyLinkedAccounts from "@/hooks/usePrivyLinkedAccounts";

const loadingMessages: string[] = [
  "Creating opponent fleet...",
  "Completing fleet coordinates...",
  "Loading battleships and environments...",
  "Initializing smart contract...",
  "Deploying smart contract...",
];

function getShipCells(ship: ShipType): string[] {
  const length = SHIP_LENGTHS[ship.variant];
  const cells: string[] = [];
  for (let i = 0; i < length; i++) {
    const x =
      ship.orientation === "horizontal" ? ship.position.x + i : ship.position.x;
    const y =
      ship.orientation === "vertical" ? ship.position.y + i : ship.position.y;
    cells.push(`${x}-${y}`);
  }
  return cells;
}

export default function GameSession() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const { evmWallet } = usePrivyLinkedAccounts();
  const { gameState } = useSystemFunctions();
  const {
    fetchGameSessionInformation,
    submitBoardCommitment,
    registerGameContract,
  } = useGameActions();

  // 1) WebSocket connection
  const { isConnected, connectionError, on, off, send } =
    useGameWebSocket(sessionId);

  // 2) loading
  const { messages, loadingDone } = useLoadingSequence(loadingMessages);

  // 3) info toggling
  const { infoShow, userDismissedInfo, setUserDismissedInfo } = useToggleInfo();

  // 4) core game state
  const [mode, setMode] = useState<"setup" | "game">("setup");
  const [shipsInPosition, setShipsInPosition] = useState<
    Record<IKPShip["variant"], boolean>
  >({
    carrier: false,
    battleship: false,
    cruiser: false,
    submarine: false,
    destroyer: false,
  });
  const [placedShips, setPlacedShips] = useState<ShipType[]>([]);
  const [overlaps, setOverlaps] = useState<{ x: number; y: number }[]>([]);
  const [shots, setShots] = useState<
    Record<string, { type: "hit" | "miss"; stage?: "smoke" }>
  >({});
  const [generalMessageKey, setGeneralMessageKey] =
    useState<GeneralMessageKey>("game-start");
  const [inventoryVisible, setInventoryVisible] = useState<boolean>(true);
  const [showVictory, setShowVictory] = useState<boolean>(false);
  const [isWinner, setIsWinner] = useState<boolean>(false);
  const [gamePlayerId, setGamePlayerId] = useState<string>("");
  const [currentTurn, setCurrentTurn] = useState<{
    playerId: string;
    isMyTurn: boolean;
  } | null>(null);
  // track each player’s JOIN status from WS (“WAITING”, “SETUP”, etc.)
  const [playerStatus, setPlayerStatus] = useState<string>("");
  const [opponentStatus, setOpponentStatus] = useState<string>("");

  // Ensure we have the game session info
  useEffect(() => {
    if (sessionId) {
      fetchGameSessionInformation(sessionId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // Set player ID once Privy is loaded
  useEffect(() => {
    if (evmWallet?.address) {
      setGamePlayerId(evmWallet.address);
    }
  }, [evmWallet?.address]);

  // 5) WebSocket Event Handlers
  useEffect(() => {
    // 📥 DEBUG: log every incoming message
    on.message("*", (data) => {
      console.debug("🔴 WS raw message:", data);
    });

    // Handler for initial session state
    const handleSessionState = (data: SessionStateMessage) => {
      console.log("Session state received:", data);

      // We'll just store data and let the UI update later
      // Handle different game states
      if (data.status === "WAITING") {
        // Waiting for another player to join
        // TODO: UI update - show waiting for opponent
      } else if (data.status === "SETUP") {
        // Both players joined, now setting up boards
        // → register the on‑chain game contract (using dummy values for now)
        registerGameContract(
          /* gameContractAddress */ "0xDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF",
          /* gameId               */ "dummy-game-id"
        );
      } else if (data.status === "ACTIVE") {
        // Game has started
        setMode("game");

        // Track whose turn it is
        const isMyTurn = data.currentTurn === gamePlayerId;
        setCurrentTurn({
          playerId: data.currentTurn || "",
          isMyTurn,
        });

        // TODO: UI update - show active game / your turn or opponent turn
      }
    };

    // Handler for player joined event
    const handlePlayerJoined = (data: PlayerJoinedMessage) => {
      console.log("Player joined:", data);

      // data.status holds "WAITING" or "SETUP" etc. for that address
      if (data.address === gamePlayerId) {
        setPlayerStatus(data.status);
      } else {
        setOpponentStatus(data.status);
      }

      // Note: Redux store update for players happens via fetchGameSessionInformation
      // We can trigger a refresh here if needed
    };

    // Handler for board submitted event
    const handleBoardSubmitted = (data: BoardSubmittedMessage) => {
      console.log("Board submitted:", data);

      if (data.player === gamePlayerId) {
        setPlayerStatus("READY");
      } else {
        setOpponentStatus("READY");
      }

      if (data.allBoardsSubmitted) {
        setMode("game");
        setGeneralMessageKey("game-start");

        if (isConnected) {
          send({ type: "game_started_ack", sessionId });
        }
      }
    };

    // Handler for game started event
    const handleGameStarted = (data: GameStartedMessage) => {
      console.log("Game started:", data);

      // Game has officially started
      setMode("game");

      // Track whose turn it is
      const isMyTurn = data.currentTurn === gamePlayerId;
      setCurrentTurn({
        playerId: data.currentTurn,
        isMyTurn,
      });

      // TODO: UI update - show game has started / active game board

      // Contract info would be updated in redux
      // If needed, we could dispatch an action here to update the store
    };

    // Handler for shot fired event
    const handleShotFired = (data: ShotFiredMessage) => {
      console.log("Shot fired:", data);

      // Update whose turn it is
      const nextTurnIsMe = data.nextTurn === gamePlayerId;
      setCurrentTurn({
        playerId: data.nextTurn,
        isMyTurn: nextTurnIsMe,
      });

      if (data.player === gamePlayerId) {
        // I fired a shot, waiting for result
        // TODO: UI update - show waiting for shot result
      } else {
        // Opponent fired a shot at coordinates (data.x, data.y)
        // We'll find out if it hit in the shot_result event
        // TODO: UI update - show opponent's shot location and it's my turn
      }
    };

    // Handler for shot result event
    const handleShotResult = (data: ShotResultMessage) => {
      console.log("Shot result:", data);

      if (data.player === gamePlayerId) {
        // This is result of my shot on opponent's board
        // Update opponent's board visualization
        handleShoot(data.x, data.y, data.isHit);
        // TODO: UI update - show hit/miss on opponent's board
      } else {
        // This is result of opponent's shot on my board
        const key = `${data.x}-${data.y}`;

        if (data.isHit) {
          // Update the ship's hit map for my board
          setPlacedShips((prev) =>
            prev.map((ship) => {
              const cells = getShipCells(ship);
              const idx = cells.indexOf(key);
              if (idx < 0) return ship;

              // Mark this ship as hit at this position
              const newHitMap = [...ship.hitMap];
              newHitMap[idx] = true;
              return { ...ship, hitMap: newHitMap };
            })
          );

          // Check if hit caused ship to sink
          const didSink = placedShips.some((ship) => {
            const cells = getShipCells(ship);
            const idx = cells.indexOf(key);
            if (idx < 0) return false;

            const hypothetical = [...ship.hitMap];
            hypothetical[idx] = true;
            return hypothetical.every(Boolean);
          });

          // TODO: UI update - show opponent hit or sunk my ship
        } else {
          // TODO: UI update - show opponent missed
        }
      }
    };

    // Handler for game over event
    const handleGameOver = (data: GameOverMessage) => {
      console.log("Game over:", data);

      // Game has ended, determine if I won
      const playerWon = data.winner === gamePlayerId;

      // Update victory/defeat state
      setIsWinner(playerWon);
      setShowVictory(true);

      // TODO: UI update - show victory or defeat screen
    };

    // Handler for errors
    const handleError = (data: ErrorMessage) => {
      console.error("WebSocket error:", data);
      // TODO: UI update - show error message to user
    };

    // Register all event handlers with proper types
    on.session_state(handleSessionState);
    on.player_joined(handlePlayerJoined);
    on.board_submitted(handleBoardSubmitted);
    on.game_started(handleGameStarted);
    on.shot_fired(handleShotFired);
    on.shot_result(handleShotResult);
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
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, gamePlayerId, on, off, placedShips]);

  // Ping the socket
  useEffect(() => {
    if (!isConnected) return;
    const id = setInterval(() => {
      send({ type: "ping" });
    }, 30000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]);

  // 6) placement helpers
  function placeRandomly(variant: IKPShip["variant"]) {
    setPlacedShips((prev) => {
      const other = prev.filter((s) => s.variant !== variant);
      let newShip: ShipType;
      const length = SHIP_LENGTHS[variant];
      const maxX = GRID_SIZE - length;
      const maxY = GRID_SIZE - 1;

      do {
        const randomX = Math.floor(Math.random() * (maxX + 1));
        const randomY = Math.floor(Math.random() * (maxY + 1));
        newShip = {
          id: variant,
          variant,
          orientation: "horizontal",
          position: { x: randomX, y: randomY },
          hitMap: Array(length).fill(false),
        };
      } while (!isValidPlacement(newShip, other));

      setShipsInPosition((pos) => ({ ...pos, [variant]: true }));
      return [...other, newShip];
    });
  }

  function shuffleShips() {
    setPlacedShips((prev) => {
      const newShips: ShipType[] = [];

      prev.forEach((ship) => {
        let candidate: ShipType;
        const length = SHIP_LENGTHS[ship.variant];

        do {
          const maxX =
            ship.orientation === "horizontal"
              ? GRID_SIZE - length
              : GRID_SIZE - 1;
          const maxY =
            ship.orientation === "vertical"
              ? GRID_SIZE - length
              : GRID_SIZE - 1;

          const randomX = Math.floor(Math.random() * (maxX + 1));
          const randomY = Math.floor(Math.random() * (maxY + 1));
          candidate = { ...ship, position: { x: randomX, y: randomY } };
        } while (!isValidPlacement(candidate, newShips));

        newShips.push(candidate);
      });

      return newShips;
    });
  }

  function flipShip(id: string) {
    setPlacedShips((prev) =>
      prev.map((ship) => {
        if (ship.id !== id) return ship;
        const length = SHIP_LENGTHS[ship.variant];
        const newOrientation =
          ship.orientation === "horizontal" ? "vertical" : "horizontal";
        const maxX =
          newOrientation === "horizontal" ? GRID_SIZE - length : GRID_SIZE - 1;
        const maxY =
          newOrientation === "vertical" ? GRID_SIZE - length : GRID_SIZE - 1;
        const x = Math.min(ship.position.x, maxX);
        const y = Math.min(ship.position.y, maxY);
        return { ...ship, orientation: newOrientation, position: { x, y } };
      })
    );
  }

  function updateShipPosition(id: string, newPos: { x: number; y: number }) {
    setPlacedShips((prev) =>
      prev.map((ship) =>
        ship.id === id ? { ...ship, position: newPos } : ship
      )
    );
  }

  function handleOverlap(newOverlaps: { x: number; y: number }[]) {
    setOverlaps(newOverlaps);
  }

  const handleShoot = useCallback(
    (x: number, y: number, isHit: boolean) => {
      const key = `${x}-${y}`;

      setShots((prev) => {
        // Prevent flickering: don't overwrite if smoke already displayed
        if (prev[key]?.stage === "smoke") return prev;
        return {
          ...prev,
          [key]: { type: isHit ? "hit" : "miss" },
        };
      });

      if (isHit) {
        // Update the ship's hit map
        setPlacedShips((prev) =>
          prev.map((ship) => {
            const cells = getShipCells(ship);
            const idx = cells.indexOf(key);
            if (idx < 0) return ship;

            const newHitMap = [...ship.hitMap];
            newHitMap[idx] = true;
            return { ...ship, hitMap: newHitMap };
          })
        );

        // Check if this hit caused a ship to sink
        const didSink = placedShips.some((ship) => {
          const cells = getShipCells(ship);
          const idx = cells.indexOf(key);
          if (idx < 0) return false;

          const hypothetical = [...ship.hitMap];
          hypothetical[idx] = true;
          return hypothetical.every(Boolean);
        });

        setGeneralMessageKey(didSink ? "sunk" : "hit");

        // Delay smoke update
        setTimeout(() => {
          setShots((prev) => {
            if (prev[key]?.type === "hit") {
              return {
                ...prev,
                [key]: { ...prev[key], stage: "smoke" },
              };
            }
            return prev;
          });
        }, 1500);
      } else {
        setGeneralMessageKey("missed");
      }
    },
    [placedShips, setPlacedShips, setShots, setGeneralMessageKey]
  );

  // Prepare board commitment from placed ships and submit it
  const onReady = useCallback(() => {
    if (overlaps.length > 0) return;

    if (window.innerWidth < 768 && inventoryVisible) {
      setInventoryVisible(false);
      return;
    }

    const boardCommitment = JSON.stringify(placedShips);

    if (evmWallet?.address) {
      submitBoardCommitment(boardCommitment, {
        onSuccess: () => {
          console.log("Board commitment submitted successfully");

          setMode("game");
          setGeneralMessageKey("waiting");

          if (isConnected) {
            send({
              type: "board_submitted",
              player: gamePlayerId,
              allBoardsSubmitted: false,
              gameStatus: mode,
            });
          }
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    placedShips,
    overlaps,
    evmWallet?.address,
    inventoryVisible,
    isConnected,
    gamePlayerId,
    mode,
  ]);

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

          <GameHeader mode={mode} onPause={() => {}} onHam={() => {}} />

          <SetupPanel
            inventoryVisible={inventoryVisible}
            setInventoryVisible={() => setInventoryVisible(true)}
            shipsInPosition={shipsInPosition}
            onPlaceShip={placeRandomly}
            onShuffle={shuffleShips}
            onReady={onReady}
            disableReadyButton={overlaps.length > 0}
            mode={mode}
          />

          <GameBoardContainer
            placedShips={placedShips}
            updateShipPosition={updateShipPosition}
            flipShip={flipShip}
            handleOverlap={handleOverlap}
            mode={mode}
            shots={shots}
            handleShoot={handleShoot}
            generalMessageKey={generalMessageKey}
            disableReadyButton={overlaps.length > 0}
            inventoryVisible={inventoryVisible}
            setMode={setMode}
            onReady={onReady}
          />

          <GameFooter
            overlaps={overlaps}
            infoShow={infoShow}
            setUserDismissedInfo={setUserDismissedInfo}
            generalMessageKey={generalMessageKey}
            playerAddress={gamePlayerId}
            opponentAddress={gameState.gameSessionInfo?.players?.find(
              (p) => p !== gamePlayerId
            )}
            playerStatus={
              gameState.gameSessionInfo?.players?.includes(gamePlayerId)
                ? "WAITING"
                : "JOINING..."
            }
            opponentStatus={
              gameState.gameSessionInfo?.players?.some(
                (p) => p !== gamePlayerId
              )
                ? "WAITING"
                : "JOINING..."
            }
          />
        </motion.div>
      )}

      <VictoryStatus show={showVictory} status={isWinner ? "win" : "loss"} />
    </div>
  );
}
