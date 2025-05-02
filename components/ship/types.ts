interface IKPShip {
  variant: "carrier" | "battleship" | "cruiser" | "submarine" | "destroyer";
  orientation: "horizontal" | "vertical";
  hitMap: boolean[];
  position?: { x: number; y: number };
  onClick?: () => void;
}
