"use client";
import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import classNames from "classnames";

import KPShip from "@/components/ship";
import { useScreenDetect } from "@/hooks/useScreenDetect";
import { GRID_SIZE } from "@/constants/gameConfig";

const SHIP_LENGTHS: Record<IKPShip["variant"], number> = {
  Carrier: 5,
  Battleship: 4,
  Cruiser: 3,
  Submarine: 3,
  Destroyer: 2,
};

export interface ShipType {
  id: string;
  variant: IKPShip["variant"];
  orientation: IKPShip["orientation"];
  position: { x: number; y: number };
  hitMap: boolean[];
}

interface BoardProps {
  ships: ShipType[];
  onShipPositionChange?: (id: string, pos: { x: number; y: number }) => void;
  onShipFlip?: (id: string) => void;
  onOverlap?: (overlaps: { x: number; y: number }[]) => void;
  mode?: "setup" | "game";
  shots: Record<string, { type: "hit" | "miss"; stage?: "smoke" }>;
  onShoot: (x: number, y: number, isHit: boolean) => void;
  showAllShipsInGame?: boolean;
}

const Board: React.FC<BoardProps> = ({
  ships,
  onShipPositionChange,
  onShipFlip,
  onOverlap,
  mode = "setup",
  onShoot,
  shots,
  showAllShipsInGame,
}) => {
  const { isXSmall, isSmall, isMedium, isLarge, isXLarge, is2XLarge } =
    useScreenDetect();

  let cellSize: number;
  if (is2XLarge) {
    cellSize = 62;
  } else if (isXLarge) {
    cellSize = 56;
  } else if (isLarge) {
    cellSize = 48;
  } else if (isMedium) {
    cellSize = 40;
  } else if (isSmall) {
    cellSize = 32;
  } else if (isXSmall) {
    cellSize = 28;
  } else {
    cellSize = 32;
  }

  const [hoveredCell, setHoveredCell] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [overlaps, setOverlaps] = useState<{ x: number; y: number }[]>([]);
  const prevOverlapsRef = useRef<{ x: number; y: number }[]>([]);
  const cellsRef = useRef<HTMLDivElement>(null);
  const shipsRef = useRef<ShipType[]>(ships);
  shipsRef.current = ships;

  // Detect overlaps
  useEffect(() => {
    const occupied: Record<string, string> = {};
    const adjacentMap: Record<string, Set<string>> = {};

    ships.forEach(({ id, variant, orientation, position }) => {
      const length = SHIP_LENGTHS[variant];

      for (let i = 0; i < length; i++) {
        const x = orientation === "horizontal" ? position.x + i : position.x;
        const y = orientation === "vertical" ? position.y + i : position.y;
        const key = `${x}-${y}`;

        // Mark as occupied
        occupied[key] = id;

        // Mark surrounding adjacent cells (3x3 around each segment)
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            const nx = x + dx;
            const ny = y + dy;
            const nKey = `${nx}-${ny}`;

            // Skip out-of-bound or center (actual ship cell)
            if (
              nx < 0 ||
              ny < 0 ||
              nx >= GRID_SIZE ||
              ny >= GRID_SIZE ||
              (dx === 0 && dy === 0)
            )
              continue;

            if (!adjacentMap[nKey]) {
              adjacentMap[nKey] = new Set();
            }

            adjacentMap[nKey].add(id);
          }
        }
      }
    });

    const newOverlaps: { x: number; y: number }[] = [];

    Object.entries(occupied).forEach(([key, shipId]) => {
      if (adjacentMap[key]) {
        const touching = [...adjacentMap[key]].filter(
          (otherId) => otherId !== shipId
        );
        if (touching.length > 0) {
          const [xStr, yStr] = key.split("-");
          newOverlaps.push({ x: parseInt(xStr), y: parseInt(yStr) });
        }
      }
    });

    // Deep equality check
    const overlapsEqual =
      newOverlaps.length === overlaps.length &&
      newOverlaps.every(
        (o, i) => o.x === overlaps[i]?.x && o.y === overlaps[i]?.y
      );

    if (!overlapsEqual) {
      setOverlaps(newOverlaps);
      onOverlap?.(newOverlaps);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ships]);

  const handleCellClick = (x: number, y: number) => {
    if (mode !== "game") return;
    const key = `${x}-${y}`;
    if (shots[key]) return;

    const isHit = ships.some((ship) => {
      const length = SHIP_LENGTHS[ship.variant];
      for (let i = 0; i < length; i++) {
        const cx =
          ship.orientation === "horizontal"
            ? ship.position.x + i
            : ship.position.x;
        const cy =
          ship.orientation === "vertical"
            ? ship.position.y + i
            : ship.position.y;
        if (cx === x && cy === y) return true;
      }
      return false;
    });

    onShoot(x, y, isHit);
    if (isHit) {
      setTimeout(() => {
        onShoot(x, y, true);
      }, 5000);
    }
  };

  const renderedShips =
    mode === "setup" || showAllShipsInGame
      ? ships
      : ships.filter((ship) => ship.hitMap.every(Boolean));

  return (
    <div className="relative inline-block">
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${GRID_SIZE}, ${cellSize}px)`,
        }}
      >
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
          const x = index % GRID_SIZE;
          const y = Math.floor(index / GRID_SIZE);
          const key = `${x}-${y}`;
          const isHovered = hoveredCell?.x === x && hoveredCell?.y === y;
          const isOverlap = overlaps.some((o) => o.x === x && o.y === y);
          const shot = shots[key];

          // Check if this cell is part of a sunk ship
          let isSunkCell = false;
          if (mode === "game" && ships.length > 0) {
            for (const ship of ships) {
              if (ship.hitMap.every(Boolean)) {
                for (let i = 0; i < ship.hitMap.length; i++) {
                  const sx =
                    ship.orientation === "horizontal"
                      ? ship.position.x + i
                      : ship.position.x;
                  const sy =
                    ship.orientation === "vertical"
                      ? ship.position.y + i
                      : ship.position.y;
                  if (sx === x && sy === y) {
                    isSunkCell = true;
                    break;
                  }
                }
              }
              if (isSunkCell) break;
            }
          }

          return (
            <div
              key={key}
              onMouseEnter={() => setHoveredCell({ x, y })}
              onMouseLeave={() => setHoveredCell(null)}
              onClick={() => handleCellClick(x, y)}
              className={classNames(
                "relative border-[0.5px] lg:border border-white/50 lg:border-white/25",
                {
                  ...(mode === "setup"
                    ? {
                        "bg-white/10": isHovered && !isOverlap,
                        "bg-red-500/30": isOverlap,
                      }
                    : { "bg-white/10": isHovered }),
                }
              )}
              style={{ width: cellSize, height: cellSize }}
            >
              {mode === "game" && shot && !isSunkCell && (
                <div
                  className={classNames(
                    "absolute inset-0 flex items-center justify-center pointer-events-none",
                    {
                      "z-[30]": shot.stage === "smoke", // ensure smoke sits on top
                      "z-[20]": shot.type === "hit" && !shot.stage,
                      "z-[10]": shot.type === "miss",
                    }
                  )}
                >
                  {shot.type === "miss" ? (
                    <Image
                      src="/images/smoke.gif"
                      alt="smoke"
                      width={Math.floor(cellSize * 0.9)}
                      height={Math.floor(cellSize * 0.9)}
                      unoptimized
                      className="pointer-events-none block mx-auto my-auto object-contain"
                    />
                  ) : (
                    <Image
                      src="/images/fire.png"
                      alt="hit"
                      width={Math.floor(cellSize * 0.85)}
                      height={Math.floor(cellSize * 0.85)}
                      quality={80}
                      className="pointer-events-none block mx-auto my-auto object-contain"
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div
        ref={cellsRef}
        className={classNames("absolute", {
          "pointer-events-none": mode === "game",
        })}
        style={{
          top: 0,
          left: 0,
          width: GRID_SIZE * cellSize,
          height: GRID_SIZE * cellSize,
        }}
      >
        {renderedShips.map((ship) => (
          <KPShip
            key={ship.id}
            parentRef={cellsRef}
            variant={ship.variant}
            orientation={ship.orientation}
            position={ship.position}
            hitMap={ship.hitMap}
            onPositionChange={(pos) => onShipPositionChange?.(ship.id, pos)}
            onClick={() => onShipFlip?.(ship.id)}
            cellSize={cellSize}
            dragDisabled={mode === "game"}
            gridSize={GRID_SIZE}
          />
        ))}
      </div>
    </div>
  );
};

export default Board;
