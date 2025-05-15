const GRID_SIZE = 10;
const SHIP_LENGTHS: Record<IKPShip["variant"], number> = {
  Carrier: 5,
  Battleship: 4,
  Cruiser: 3,
  Submarine: 3,
  Destroyer: 2,
};

export { GRID_SIZE, SHIP_LENGTHS };
