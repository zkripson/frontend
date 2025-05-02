// GameSession.tsx
"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

import {
  KPFullscreenLoader,
  KPGameBadge,
  KPIconButton,
  KPProfileBadge,
  KPTimer,
} from "@/components";
import Inventory from "./components/inventory";
import Board from "./components/board";

const loadingMessages = [
  "Creating opponent fleet...",
  "Completing fleet coordinates...",
  "Loading battleships and environments...",
  "Initializing smart contract...",
  "Deploying smart contract...",
];

const GRID_SIZE = 8;
// map variants to lengths for overlap and placement logic
const SHIP_LENGTHS: Record<IKPShip["variant"], number> = {
  carrier: 5,
  battleship: 4,
  cruiser: 3,
  submarine: 3,
  destroyer: 2,
};

// helper to get all occupied cells of a ship
const getShipCells = (ship: ShipType) => {
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
};

const GameSession = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [loadingDone, setLoadingDone] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mode, setMode] = useState<"setup" | "game">("setup");

  // track which variants have been placed
  const [shipsInPosition, setShipsInPosition] = useState<
    Record<IKPShip["variant"], boolean>
  >({
    carrier: false,
    battleship: false,
    cruiser: false,
    submarine: false,
    destroyer: false,
  });

  // ships placed on the board
  const [placedShips, setPlacedShips] = useState<ShipType[]>([]);

  // track overlapping cells
  const [overlaps, setOverlaps] = useState<{ x: number; y: number }[]>([]);

  // place a ship at a random, non-overlapping, clamped position
  const placeRandomly = (variant: IKPShip["variant"]) => {
    setPlacedShips((prev) => {
      const otherShips = prev.filter((s) => s.variant !== variant);
      let newShip: ShipType;
      const length = SHIP_LENGTHS[variant];
      const maxX = GRID_SIZE - length;
      const maxY = GRID_SIZE - 1;
      // try until we find a non-overlapping spot
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
      } while (
        getShipCells(newShip).some((cell) =>
          otherShips.flatMap(getShipCells).includes(cell)
        )
      );
      setShipsInPosition((prevPos) => ({ ...prevPos, [variant]: true }));
      return [...otherShips, newShip];
    });
  };

  // shuffle all placed ships into non-overlapping, clamped positions
  const shuffleShips = () => {
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
        } while (
          getShipCells(candidate).some((cell) =>
            newShips.flatMap(getShipCells).includes(cell)
          )
        );
        newShips.push(candidate);
      });
      return newShips;
    });
  };

  // flip orientation when a ship is tapped, then clamp its position
  const flipShip = (id: string) => {
    setPlacedShips((prev) =>
      prev.map((ship) => {
        if (ship.id !== id) return ship;
        const length = SHIP_LENGTHS[ship.variant];
        const newOri =
          ship.orientation === "horizontal" ? "vertical" : "horizontal";
        const maxX =
          newOri === "horizontal" ? GRID_SIZE - length : GRID_SIZE - 1;
        const maxY = newOri === "vertical" ? GRID_SIZE - length : GRID_SIZE - 1;
        const x = Math.min(ship.position.x, maxX);
        const y = Math.min(ship.position.y, maxY);
        return { ...ship, orientation: newOri, position: { x, y } };
      })
    );
  };

  // update a ship's snapped position
  const updateShipPosition = (id: string, newPos: { x: number; y: number }) => {
    setPlacedShips((prev) =>
      prev.map((ship) =>
        ship.id === id ? { ...ship, position: newPos } : ship
      )
    );
  };

  // callback from Board when overlaps change
  const handleOverlap = (newOverlaps: { x: number; y: number }[]) => {
    setOverlaps(newOverlaps);
  };

  const handleCellClick = (x: number, y: number) => {
    setPlacedShips((prev) =>
      prev.map((ship) => {
        // build the occupied cells for this ship
        const cells = getShipCells(ship);
        const key = `${x}-${y}`;
        const idx = cells.indexOf(key);
        if (idx >= 0) {
          // it's a hit on segment idx
          const newHitMap = [...ship.hitMap];
          newHitMap[idx] = true;
          return { ...ship, hitMap: newHitMap };
        }
        return ship;
      })
    );
  };

  const onReady = () => {
    setMode("game");
  };

  // loading sequence
  useEffect(() => {
    if (currentIndex >= loadingMessages.length) {
      const timer = setTimeout(() => setLoadingDone(true), 2000);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => {
      setMessages((prev) => [...prev, loadingMessages[currentIndex]]);
      setCurrentIndex((prev) => prev + 1);
    }, 2000);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  return (
    <div className="relative flex items-center justify-center flex-1">
      <AnimatePresence>
        {!loadingDone && (
          <motion.div
            key="loader"
            className="absolute inset-0 z-[9999]"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <KPFullscreenLoader
              title="loading new game..."
              loadingMessages={messages}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {loadingDone && (
        <motion.div
          key="game"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full h-full flex flex-col items-center justify-center"
        >
          <div className="fixed top-[5%] left-0 flex items-center justify-between w-full px-12">
            <KPProfileBadge
              username="Choco"
              variant="secondary"
              balance={37.56}
            />

            <div className="flex items-center gap-6">
              <KPTimer initialSeconds={60} />
              <KPIconButton icon="pause" onClick={() => {}} />
              <KPIconButton icon="ham" onClick={() => {}} />
            </div>
          </div>

          <Inventory
            shipsInPosition={shipsInPosition}
            onPlaceShip={placeRandomly}
            onShuffle={shuffleShips}
            onReady={onReady}
            disableReady={overlaps.length > 0}
          />

          {/* overlap warning */}
          {overlaps.length > 0 && (
            <div className="mb-4 p-2 bg-red-600 text-white rounded">
              Error: Ships cannot overlap!
            </div>
          )}

          <div>
            <Board
              ships={placedShips}
              onShipPositionChange={updateShipPosition}
              onShipFlip={flipShip}
              onOverlap={handleOverlap}
              onCellClick={handleCellClick}
              mode={mode}
            />
          </div>

          <div className="fixed bottom-[5%] right-0 flex items-center justify-between w-full px-12">
            <KPGameBadge status="ready" username="Choco" isPlayer />
            <KPGameBadge
              status="joining..."
              username="Njoku"
              avatarUrl="/images/kripson.jpeg"
              isPlayer={false}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default GameSession;
