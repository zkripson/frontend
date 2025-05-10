import Board from "./board";
import General, { GeneralMessageKey } from "./general";
import { KPClickAnimation } from "@/components";

interface GameBoardContainerProps {
  placedShips: ShipType[];
  updateShipPosition: (id: string, pos: { x: number; y: number }) => void;
  flipShip: (id: string) => void;
  handleOverlap: (overlaps: { x: number; y: number }[]) => void;
  mode: "setup" | "game";
  shots: Record<string, { type: "hit" | "miss"; stage?: "smoke" }>;
  handleShoot: (x: number, y: number, isHit: boolean) => void;
  generalMessageKey: GeneralMessageKey;
  disableReadyButton: boolean;
  inventoryVisible: boolean;
  setMode: (mode: "setup" | "game") => void;
  onReady: () => void;
}

export function GameBoardContainer({
  placedShips,
  updateShipPosition,
  flipShip,
  handleOverlap,
  mode,
  shots,
  handleShoot,
  generalMessageKey,
  disableReadyButton,
  inventoryVisible,
  setMode,
  onReady,
}: GameBoardContainerProps) {
  return (
    <div className="relative">
      <Board
        ships={placedShips}
        onShipPositionChange={updateShipPosition}
        onShipFlip={flipShip}
        onOverlap={handleOverlap}
        mode={mode}
        shots={shots}
        onShoot={handleShoot}
      />

      {mode === "setup" && (
        <div className="lg:hidden w-full absolute top-[103%] left-0">
          <KPClickAnimation
            disabled={disableReadyButton || inventoryVisible}
            className="flex justify-center items-center border rounded-[4px] w-full h-[38px] pt-2 bg-primary-200 border-primary-300 text-white cursor-pointer transition-all duration-500 shadow-[inset_0px_2px_0px_0px_#632918]"
            onClick={onReady}
          >
            <span className="uppercase text-[20px] leading-none tracking-[2%] font-MachineStd">
              ready
            </span>
          </KPClickAnimation>
        </div>
      )}

      <div className="md:hidden">
        <General show={mode === "game"} messageKey={generalMessageKey} />
      </div>
    </div>
  );
}
