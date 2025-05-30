"use client";

import useSystemFunctions from "@/hooks/useSystemFunctions";
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
  onReady: () => void;
  onFireShot: (x: number, y: number) => void;
  opponentShips?: ShipType[];
  waitingForOpponent?: boolean;
  yourTurn?: boolean;
  boardSubmitted?: boolean;
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
  onReady,
  onFireShot,
  opponentShips = [],
  waitingForOpponent,
  yourTurn,
  boardSubmitted,
}: GameBoardContainerProps) {
  const {
    gameState: { loadingSubmitBoardCommitment },
  } = useSystemFunctions();

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
    const setupFeedbackArray = [
      <KPClickAnimation
        key="ready-btn"
        disabled={disableReadyButton}
        className="flex justify-center items-center border rounded-[4px] w-full h-[38px] pt-2 bg-primary-200 border-primary-300 text-white cursor-pointer transition-all duration-500 shadow-[inset_0px_2px_0px_0px_#632918]"
        onClick={onReady}
        loading={loadingSubmitBoardCommitment}
      >
        <span className="uppercase text-[20px] leading-none tracking-[2%] font-MachineStd">
          {waitingForOpponent ? "Waiting for opponent" : "Ready"}
        </span>
      </KPClickAnimation>,
      <div className="bp1215:hidden" key="waiting-feedback">
        <General
          messageKey={generalMessage?.key ?? null}
          uniqueId={generalMessage?.id}
          shipName={generalMessage?.shipName}
        />
      </div>,
    ];

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
          boardSubmitted={boardSubmitted}
        />
        <div className="w-full absolute top-[103%] left-0">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={
                generalMessage?.key === "waiting"
                  ? "waiting-feedback"
                  : "ready-btn"
              }
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="w-full flex items-center justify-center"
            >
              {generalMessage?.key !== "waiting" && (
                <KPClickAnimation
                  key="ready-btn"
                  disabled={disableReadyButton}
                  className="flex justify-center items-center border rounded-[4px] w-full h-[38px] pt-2 bg-primary-200 border-primary-300 text-white cursor-pointer transition-all duration-500 shadow-[inset_0px_2px_0px_0px_#632918]"
                  onClick={onReady}
                  loading={loadingSubmitBoardCommitment}
                >
                  <span className="uppercase text-[20px] leading-none tracking-[2%] font-MachineStd">
                    {waitingForOpponent ? "Waiting for opponent" : "Ready"}
                  </span>
                </KPClickAnimation>
              )}
              <div className="bp1215:hidden" key="waiting-feedback">
                <General
                  messageKey={generalMessage?.key ?? null}
                  uniqueId={generalMessage?.id}
                  shipName={generalMessage?.shipName}
                />
              </div>
            </motion.div>
          </AnimatePresence>
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
              yourTurn={yourTurn}
            />
          ) : (
            <Board
              ships={placedShips}
              mode={mode}
              shots={playerShots}
              onShoot={() => {}}
              showAllShipsInGame
              yourTurn={yourTurn}
            />
          )}
        </motion.div>
      </AnimatePresence>
      {/* always show feedback */}
      <div className="lg:hidden mt-4 top-[100%] absolute left-0 w-full flex items-center justify-center">
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
