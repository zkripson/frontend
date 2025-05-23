import Inventory from "./inventory";

interface SetupPanelProps {
  inventoryVisible: boolean;
  setInventoryVisible: () => void;
  shipsInPosition: Record<IKPShip["variant"], boolean>;
  onPlaceShip: (variant: IKPShip["variant"]) => void;
  onShuffle: () => void;
  onReady: () => void;
  disableReadyButton: boolean;
  mode: "setup" | "game";
  waitingForOpponent?: boolean;
}

export function SetupPanel({
  inventoryVisible,
  setInventoryVisible,
  shipsInPosition,
  onPlaceShip,
  onShuffle,
  onReady,
  disableReadyButton,
  mode,
  waitingForOpponent,
}: SetupPanelProps) {
  return (
    <>
      <Inventory
        visible={inventoryVisible}
        onHide={setInventoryVisible}
        shipsInPosition={shipsInPosition}
        onPlaceShip={onPlaceShip}
        onShuffle={onShuffle}
        onReady={onReady}
        disableReady={disableReadyButton}
        show={mode === "setup"}
        waitingForOpponent={waitingForOpponent}
      />
    </>
  );
}
