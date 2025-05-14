interface IKPShip {
  variant: "Carrier" | "Battleship" | "Cruiser" | "Submarine" | "Destroyer";
  orientation: "horizontal" | "vertical";
  hitMap: boolean[];
  position?: { x: number; y: number };
  onClick?: () => void;
}
