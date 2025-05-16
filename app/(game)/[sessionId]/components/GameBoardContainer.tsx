"use client";

import Board from "./board";
import General, { GeneralMessageKey } from "./general";
import { KPClickAnimation } from "@/components";
import { AnimatePresence, motion } from "framer-motion";

interface GameBoardContainerProps {
  placedShips: ShipType[];
  updateShipPosition: (id: string, pos: { x: number; y: number }) => void;
  flipShip: (id: string) => void;
  handleOverlap: (overlaps: { x: number; y: number }[]) => void;
  mode: "setup" | "game";
  playerBoard: Record<string, "ship" | "hit" | "miss" | null>;
  opponentBoard: Record<string, "hit" | "miss" | null>;
  currentTurn: { playerId: string; isMyTurn: boolean } | null;
  handleShoot: (x: number, y: number, isHit: boolean) => void;
  generalMessage: {
    key: GeneralMessageKey;
    id: number;
    shipName?: string;
  } | null;
  disableReadyButton: boolean;
  inventoryVisible: boolean;
  setMode: (mode: "setup" | "game") => void;
  onReady: () => void;
  onFireShot: (x: number, y: number) => void;
  opponentShips?: ShipType[];
}

export function GameBoardContainer({
  placedShips,
  updateShipPosition,
  flipShip,
  handleOverlap,
  mode,
  playerBoard,
  opponentBoard,
  currentTurn,
  handleShoot,
  generalMessage,
  disableReadyButton,
  inventoryVisible,
  setMode,
  onReady,
  onFireShot,
  opponentShips = [],
}: GameBoardContainerProps) {
  // build cell list 0–99 → {x,y,key}
  const cells = Array.from({ length: 100 }).map((_, i) => {
    const x = i % 10;
    const y = Math.floor(i / 10);
    return { x, y, key: `${x}-${y}` };
  });

  // Convert our board states into the shape Board expects for its `shots` prop
  const playerShots: Record<string, { type: "hit" | "miss"; stage?: "smoke" }> =
    {};
  for (const [key, val] of Object.entries(playerBoard)) {
    if (val === "hit" || val === "miss") {
      playerShots[key] = { type: val };
    }
  }
  const opponentShots: Record<
    string,
    { type: "hit" | "miss"; stage?: "smoke" }
  > = {};
  for (const [key, val] of Object.entries(opponentBoard)) {
    if (val === "hit" || val === "miss") {
      opponentShots[key] = { type: val };
    }
  }

  if (mode === "setup") {
    return (
      <div className="relative">
        <Board
          ships={placedShips}
          onShipPositionChange={updateShipPosition}
          onShipFlip={flipShip}
          onOverlap={handleOverlap}
          mode={mode}
          shots={{}}
          onShoot={handleShoot}
        />

        <div className="bp1215:hidden w-full absolute top-[103%] left-0">
          <KPClickAnimation
            disabled={disableReadyButton || inventoryVisible}
            className="flex justify-center items-center border rounded-[4px] w-full h-[38px] pt-2 bg-primary-200 border-primary-300 text-white cursor-pointer transition-all duration-500 shadow-[inset_0px_2px_0px_0px_#632918]"
            onClick={onReady}
          >
            <span className="uppercase text-[20px] leading-none tracking-[2%] font-MachineStd">
              READY
            </span>
          </KPClickAnimation>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center relative">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={currentTurn?.isMyTurn ? "my-turn" : "opponent-turn"}
          initial={{ rotateY: 180, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          exit={{ rotateY: -180, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{ perspective: 1000 }}
        >
          {currentTurn?.isMyTurn ? (
            <Board
              ships={opponentShips}
              mode={mode}
              shots={opponentShots}
              onShoot={(x, y) => {
                const key = `${x}-${y}`;
                if (opponentBoard[key] == null) onFireShot(x, y);
              }}
              showAllShipsInGame
            />
          ) : (
            <Board
              ships={placedShips}
              mode={mode}
              shots={playerShots}
              onShoot={() => {}}
              showAllShipsInGame
            />
          )}
        </motion.div>
      </AnimatePresence>
      {/* always show feedback */}
      <div className="md:hidden mt-4 top-[100%] absolute left-0 w-full flex items-center justify-center">
        <General
          messageKey={generalMessage?.key ?? null}
          uniqueId={generalMessage?.id}
          shipName={generalMessage?.shipName}
        />
      </div>
    </div>
  );
}

export default GameBoardContainer;
