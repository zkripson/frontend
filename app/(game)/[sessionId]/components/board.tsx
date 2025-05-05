// Board.tsx
"use client";

import React, { useRef, useState, useEffect, Fragment } from "react";
import classNames from "classnames";
import KPShip from "@/components/ship";
import { useScreenDetect } from "@/hooks/useScreenDetect";
import Image from "next/image";

// map variants to lengths for overlap detection
const SHIP_LENGTHS: Record<IKPShip["variant"], number> = {
  carrier: 5,
  battleship: 4,
  cruiser: 3,
  submarine: 3,
  destroyer: 2,
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
  onShipPositionChange: (id: string, pos: { x: number; y: number }) => void;
  onShipFlip: (id: string) => void;
  onOverlap: (overlaps: { x: number; y: number }[]) => void;
  mode?: "setup" | "game";
  shots: Record<string, { type: "hit" | "miss"; stage?: "smoke" }>;
  onShoot: (x: number, y: number, isHit: boolean) => void;
}

const COL_LABELS = ["A", "B", "C", "D", "E", "F", "G", "H"];
const ROW_LABELS = ["1", "2", "3", "4", "5", "6", "7", "8"];
const GRID_SIZE = 8;

const Board: React.FC<BoardProps> = ({
  ships,
  onShipPositionChange,
  onShipFlip,
  onOverlap,
  mode = "setup",
  onShoot,
  shots,
}) => {
  const { isXSmall, isSmall, isMedium, isLarge, isXLarge, is2XLarge } =
    useScreenDetect();

  let cellSize: number;
  if (is2XLarge) {
    cellSize = 78;
  } else if (isXLarge) {
    cellSize = 70;
  } else if (isLarge) {
    cellSize = 60;
  } else if (isMedium) {
    cellSize = 50;
  } else if (isSmall) {
    cellSize = 41;
  } else {
    cellSize = 41;
  }

  const isLabelSmall = isXSmall || isSmall;
  const labelCellWidth = isLabelSmall ? 32 : 40;
  const labelCellHeight = isLabelSmall ? 32 : 40;
  const labelFontSize = isLabelSmall ? 10 : 20;

  const [hoveredCell, setHoveredCell] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [overlaps, setOverlaps] = useState<{ x: number; y: number }[]>([]);
  const cellsRef = useRef<HTMLDivElement>(null);
  const shipsRef = useRef<ShipType[]>(ships);

  useEffect(() => {
    shipsRef.current = ships;
  }, [ships]);

  // detect overlaps
  useEffect(() => {
    const countMap: Record<string, number> = {};
    ships.forEach(({ variant, orientation, position }) => {
      const length = SHIP_LENGTHS[variant];
      for (let i = 0; i < length; i++) {
        const x = orientation === "horizontal" ? position.x + i : position.x;
        const y = orientation === "vertical" ? position.y + i : position.y;
        const key = `${x}-${y}`;
        countMap[key] = (countMap[key] || 0) + 1;
      }
    });
    const newOverlaps = Object.entries(countMap)
      .filter(([, count]) => count > 1)
      .map(([key]) => {
        const [xStr, yStr] = key.split("-");
        return { x: parseInt(xStr, 10), y: parseInt(yStr, 10) };
      });
    setOverlaps(newOverlaps);
    onOverlap(newOverlaps);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ships]);

  const handleCellClick = (x: number, y: number) => {
    // ignore all clicks unless we're in game mode
    if (mode !== "game") return;

    const key = `${x}-${y}`;

    // already shot here?
    if (shots[key]) return;

    // determine hit or miss
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

    // notify GameSession
    onShoot(x, y, isHit);

    // if a hit, schedule the smoke stage
    if (isHit) {
      setTimeout(() => {
        onShoot(x, y, true);
      }, 5000);
    }
  };

  // only sunk ships in game mode
  const renderedShips =
    mode === "game"
      ? ships.filter((ship) => ship.hitMap.every((h) => h))
      : ships;

  return (
    <div className="relative inline-block">
      {/* labels + cell grid */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: `${labelCellWidth}px repeat(${GRID_SIZE}, ${cellSize}px)`,
          gridTemplateRows: `${labelCellHeight}px repeat(${GRID_SIZE}, ${cellSize}px)`,
        }}
      >
        {/* corner */}
        <div className="border-[0.5px] lg:border border-white/50 lg:border-white/25" />

        {/* column labels */}
        {COL_LABELS.map((label) => (
          <div
            key={label}
            className="flex items-center justify-center border-[0.5px] lg:border border-white/50 lg:border-white/25"
            style={{
              width: cellSize,
              height: labelCellHeight,
              fontSize: labelFontSize,
            }}
          >
            {label}
          </div>
        ))}

        {/* rows + cells */}
        {ROW_LABELS.map((rowLabel, rowIndex) => (
          <Fragment key={rowLabel}>
            {/* row label */}
            <div
              className="flex items-center justify-center border-[0.5px] lg:border border-white/50 lg:border-white/25"
              style={{
                width: labelCellWidth,
                height: cellSize,
                fontSize: labelFontSize,
              }}
            >
              {rowLabel}
            </div>
            {/* grid cells */}
            {COL_LABELS.map((_, colIndex) => {
              const isHovered =
                hoveredCell?.x === colIndex && hoveredCell?.y === rowIndex;
              const isOverlap = overlaps.some(
                (o) => o.x === colIndex && o.y === rowIndex
              );
              const key = `${colIndex}-${rowIndex}`;
              const shot = shots[key];

              return (
                <div
                  key={key}
                  onMouseEnter={() =>
                    setHoveredCell({ x: colIndex, y: rowIndex })
                  }
                  onMouseLeave={() => setHoveredCell(null)}
                  onClick={() => handleCellClick(colIndex, rowIndex)}
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
                  {/* shot overlays in game mode */}
                  {mode === "game" && shot && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      {shot.type === "miss" ? (
                        <div className="w-3/5 h-3/5 bg-primary-700 rounded-full opacity-80" />
                      ) : shot.stage === "smoke" ? (
                        <Image
                          src="/images/smoke.gif"
                          alt="smoke"
                          width={Math.floor(cellSize * 0.9)}
                          height={Math.floor(cellSize * 0.9)}
                          unoptimized
                          className="pointer-events-none"
                        />
                      ) : (
                        <Image
                          src="/images/fire.png"
                          alt="hit"
                          width={Math.floor(cellSize * 0.85)}
                          height={Math.floor(cellSize * 0.85)}
                          quality={100}
                          className="animate-pulse pointer-events-none"
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>

      {/* draggable / ship area */}
      <div
        ref={cellsRef}
        className={classNames("absolute", {
          "pointer-events-none": mode === "game",
        })}
        style={{
          top: labelCellHeight,
          left: labelCellWidth,
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
            onPositionChange={(pos) => onShipPositionChange(ship.id, pos)}
            onClick={() => onShipFlip(ship.id)}
            cellSize={cellSize}
            dragDisabled={mode === "game"} // disable dragging in game
          />
        ))}
      </div>
    </div>
  );
};

export default Board;
