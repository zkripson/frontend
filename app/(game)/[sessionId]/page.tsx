"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useLoadingSequence } from "@/hooks/useLoadingSequence";
import { useToggleInfo } from "@/hooks/useToggleInfo";
import { LoadingOverlay } from "./components/LoadingOverlay";
import { GameHeader } from "./components/GameHeader";
import { SetupPanel } from "./components/SetupPanel";
import { GameBoardContainer } from "./components/GameBoardContainer";
import { GameFooter } from "./components/GameFooter";
import { GeneralMessageKey } from "./components/general";
import VictoryStatus from "./components/VictoryStatus";

const loadingMessages: string[] = [
  "Creating opponent fleet...",
  "Completing fleet coordinates...",
  "Loading battleships and environments...",
  "Initializing smart contract...",
  "Deploying smart contract...",
];

const GRID_SIZE = 8;
const SHIP_LENGTHS: Record<IKPShip["variant"], number> = {
  carrier: 5,
  battleship: 4,
  cruiser: 3,
  submarine: 3,
  destroyer: 2,
};

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
  // 1) loading
  const { messages, loadingDone } = useLoadingSequence(loadingMessages);

  // 2) info toggling
  const { infoShow, userDismissedInfo, setUserDismissedInfo } = useToggleInfo();

  // 3) core game state
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

  // 4) placement helpers
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
      } while (
        getShipCells(newShip).some((cell) =>
          other.flatMap(getShipCells).includes(cell)
        )
      );

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
        } while (
          getShipCells(candidate).some((cell) =>
            newShips.flatMap(getShipCells).includes(cell)
          )
        );

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

  function handleShoot(x: number, y: number, isHit: boolean) {
    const key = `${x}-${y}`;
    setShots((prev) => ({
      ...prev,
      [key]: { type: isHit ? "hit" : "miss" },
    }));

    if (isHit) {
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

      const didSink = placedShips.some((ship) => {
        const cells = getShipCells(ship);
        const idx = cells.indexOf(key);
        if (idx < 0) return false;
        const hypothetical = [...ship.hitMap];
        hypothetical[idx] = true;
        return hypothetical.every(Boolean);
      });

      setGeneralMessageKey(didSink ? "sunk" : "hit");

      setTimeout(() => {
        setShots((prev) => ({
          ...prev,
          [key]: { type: "hit", stage: "smoke" },
        }));
      }, 3000);
    } else {
      setGeneralMessageKey("missed");
    }
  }

  function onReady() {
    // mobile: hide inventory first
    if (window.innerWidth < 768) {
      setInventoryVisible(false);
    } else {
      // desktop: go straight to game
      setMode("game");
      setGeneralMessageKey("waiting");
    }
  }

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
          />

          <GameFooter
            overlaps={overlaps}
            infoShow={infoShow}
            setUserDismissedInfo={setUserDismissedInfo}
            generalMessageKey={generalMessageKey}
          />
        </motion.div>
      )}

      <VictoryStatus show={false} />
    </div>
  );
}
