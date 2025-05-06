const GRID_SIZE = 8;
const SHIP_LENGTHS: Record<IKPShip["variant"], number> = {
  carrier: 5,
  battleship: 4,
  cruiser: 3,
  submarine: 3,
  destroyer: 2,
};

export { GRID_SIZE, SHIP_LENGTHS };
