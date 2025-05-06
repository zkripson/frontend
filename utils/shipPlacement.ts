import { GRID_SIZE, SHIP_LENGTHS } from "@/constants/gameConfig";

export function getShipCells(ship: ShipType): string[] {
  const length = SHIP_LENGTHS[ship.variant];
  const cells: string[] = [];
  for (let i = 0; i < length; i++) {
    const x =
      ship.orientation === "horizontal" ? ship.position.x + i : ship.position.x;
    const y =
      ship.orientation === "vertical" ? ship.position.y + i : ship.position.y;
    cells.push(`${x}-${y}`);
  }
  return cells;
}

export function isValidPlacement(
  candidate: ShipType,
  otherShips: ShipType[]
): boolean {
  const length = SHIP_LENGTHS[candidate.variant];
  const startX = candidate.position.x;
  const startY = candidate.position.y;
  const endX =
    candidate.orientation === "horizontal" ? startX + length - 1 : startX;
  const endY =
    candidate.orientation === "vertical" ? startY + length - 1 : startY;

  const minX = Math.max(0, startX - 1);
  const maxX = Math.min(GRID_SIZE - 1, endX + 1);
  const minY = Math.max(0, startY - 1);
  const maxY = Math.min(GRID_SIZE - 1, endY + 1);

  const bufferZone = new Set<string>();
  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      bufferZone.add(`${x}-${y}`);
    }
  }

  const occupiedCells = otherShips.flatMap(getShipCells);
  return !occupiedCells.some((cell) => bufferZone.has(cell));
}
