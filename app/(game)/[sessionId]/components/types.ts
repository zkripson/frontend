type InventoryShips = Array<{
  variant: IKPShip["variant"];
  image: string;
  outline: React.ReactNode;
  width?: number;
  height?: number;
}>;

type InventoryProps = {
  shipsInPosition: Record<IKPShip["variant"], boolean>;
  onPlaceShip: (variant: IKPShip["variant"]) => void;
  onShuffle: () => void;
  onReady: () => void;
  disableReady: boolean;
  visible: boolean;
  onHide: () => void;
  show?: boolean;
};

interface PlacedShip {
  variant: IKPShip["variant"];
  position: { x: number; y: number };
  orientation: "horizontal" | "vertical";
  hitMap: boolean[];
}

interface ShipType {
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
  onCellClick?: (x: number, y: number) => void;
}

interface Info {
  message: string;
  type: "warning" | "info";
  onStopShowing: () => void;
  show?: boolean;
  warningTitle?: string;
}
