import { useState, useEffect, useCallback, useRef } from "react";
import useSystemFunctions from "@/hooks/useSystemFunctions";
import usePrivyLinkedAccounts from "@/hooks/usePrivyLinkedAccounts";
import { useLoadingSequence } from "@/hooks/useLoadingSequence";
import { useAudio } from "@/providers/AudioProvider";
import { useToggleInfo } from "@/hooks/useToggleInfo";
import { AI_OPPONENTS } from "@/constants/aiOpponents";

export const loadingMessages: string[] = [
  "Creating opponent fleet...",
  "Completing fleet coordinates...",
  "Loading battleships and environments...",
  "Initializing AI logic...",
  "Deploying AI fleet...",
];

const shipConfigs = [
  { name: "Carrier", length: 5 },
  { name: "Battleship", length: 4 },
  { name: "Cruiser", length: 3 },
  { name: "Submarine", length: 3 },
  { name: "Destroyer", length: 2 },
];

function getPlayerStatus({
  gameStatus,
  hasSubmitted,
  isSelf,
}: {
  gameStatus: string;
  hasSubmitted: boolean;
  isSelf: boolean;
}) {
  if (gameStatus === "CREATED" || gameStatus === "WAITING")
    return isSelf ? "Joined" : "AI Ready";
  if (gameStatus === "SETUP") return hasSubmitted ? "Ready" : "Setup";
  if (gameStatus === "ACTIVE") return "Active";
  if (gameStatus === "COMPLETED") return "Completed";
  return "";
}

interface GameState {
  difficulty: string | null;
  gameStatus: string;
  currentTurn: string | null;
  playerBoard: number[][];
  aiBoard: number[][];
  ships: Ship[];
  aiShips: Ship[];
  winner: string | null;
  playerStats?: {
    shotsCount: number;
    hitsCount: number;
    accuracy: number;
    shipsSunk: number;
    avgTurnTime: number;
  };
  aiStats?: {
    shotsCount: number;
    hitsCount: number;
    accuracy: number;
    shipsSunk: number;
    avgTurnTime: number;
  };
}

interface Ship {
  id: string;
  name: string;
  length: number;
  cells: { x: number; y: number }[];
}

function findRandomShipPlacement(
  length: number,
  board: number[][]
): { x: number; y: number }[] | null {
  for (let attempt = 0; attempt < 1000; attempt++) {
    const isHorizontal = Math.random() > 0.5;
    const startX = Math.floor(
      Math.random() * (10 - (isHorizontal ? length : 1))
    );
    const startY = Math.floor(
      Math.random() * (10 - (isHorizontal ? 1 : length))
    );
    const cells = [];
    for (let j = 0; j < length; j++) {
      if (isHorizontal) {
        cells.push({ x: startX + j, y: startY });
      } else {
        cells.push({ x: startX, y: startY + j });
      }
    }
    if (canPlaceShip(cells, board)) return cells;
  }
  return null;
}

function canPlaceShip(cells: { x: number; y: number }[], board: number[][]) {
  for (const cell of cells) {
    if (board[cell.y][cell.x] !== 0) return false;
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const adjX = cell.x + dx;
        const adjY = cell.y + dy;
        if (adjX >= 0 && adjX < 10 && adjY >= 0 && adjY < 10) {
          if (board[adjY][adjX] !== 0) return false;
        }
      }
    }
  }
  return true;
}

function placeShipsByDifficulty(
  configs: { name: string; length: number }[],
  boardSize: number,
  noTouchBoard: number[][]
): { name: string; length: number; cells: { x: number; y: number }[] }[] {
  // 1️⃣ Build base heatmap: parity bias
  const heat = Array.from({ length: boardSize }, () =>
    Array(boardSize).fill(0)
  );
  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      heat[y][x] = (x + y) % 2 === 0 ? 2 : 1;
    }
  }

  const placements: {
    name: string;
    length: number;
    cells: { x: number; y: number }[];
  }[] = [];

  for (const { name, length } of configs) {
    let best: (typeof placements)[0] | null = null;
    let bestScore = Infinity;

    // Enumerate all legal orientations & origins
    for (const isH of [true, false]) {
      const maxX = boardSize - (isH ? length : 1);
      const maxY = boardSize - (isH ? 1 : length);
      for (let sy = 0; sy <= maxY; sy++) {
        for (let sx = 0; sx <= maxX; sx++) {
          const cells: { x: number; y: number }[] = [];
          let ok = true;
          for (let i = 0; i < length; i++) {
            const cx = sx + (isH ? i : 0),
              cy = sy + (isH ? 0 : i);
            if (!canPlaceShip([{ x: cx, y: cy }], noTouchBoard)) {
              ok = false;
              break;
            }
            cells.push({ x: cx, y: cy });
          }
          if (!ok) continue;
          // Score = sum of heatmap values
          const score = cells.reduce((s, c) => s + heat[c.y][c.x], 0);
          if (score < bestScore) {
            bestScore = score;
            best = { name, length, cells };
          }
        }
      }
    }

    // Fallback to random if nothing found
    if (!best) {
      const randCells = findRandomShipPlacement(length, noTouchBoard)!;
      best = { name, length, cells: randCells };
    }

    // Mark on noTouchBoard
    best.cells.forEach((c) => {
      noTouchBoard[c.y][c.x] = placements.length + 1;
    });
    placements.push(best);
  }

  return placements;
}

const useAIGameSession = (difficulty: string) => {
  const { activeWallet } = usePrivyLinkedAccounts();
  const { navigate } = useSystemFunctions();
  const { messages, loadingDone } = useLoadingSequence(loadingMessages);
  const [generalMessage, setGeneralMessage] = useState<{
    key: any;
    id: number;
    shipName?: string;
  } | null>(null);
  const [gameStateLocal, setGameStateLocal] = useState<GameState>({
    difficulty: difficulty,
    gameStatus: "CREATED",
    currentTurn: null,
    playerBoard: Array(10)
      .fill(0)
      .map(() => Array(10).fill(0)),
    aiBoard: Array(10)
      .fill(0)
      .map(() => Array(10).fill(0)),
    ships: [],
    aiShips: [],
    winner: null,
    playerStats: {
      shotsCount: 0,
      hitsCount: 0,
      accuracy: 0,
      shipsSunk: 0,
      avgTurnTime: 0,
    },
    aiStats: {
      shotsCount: 0,
      hitsCount: 0,
      accuracy: 0,
      shipsSunk: 0,
      avgTurnTime: 0,
    },
  });
  const audio = useAudio();
  const playSound = useCallback(
    (type: "hit" | "miss" | "place") => {
      if (audio) audio.play(type);
    },
    [audio]
  );
  const { infoShow, setUserDismissedInfo } = useToggleInfo();
  const [overlaps, setOverlaps] = useState<{ x: number; y: number }[]>([]);
  const handleOverlap = useCallback(
    (overlapCells: { x: number; y: number }[]) => {
      // Only update overlaps if the value actually changes (shallow compare)
      if (
        overlaps.length === overlapCells.length &&
        overlaps.every(
          (cell, idx) =>
            cell.x === overlapCells[idx].x && cell.y === overlapCells[idx].y
        )
      ) {
        return;
      }
      setOverlaps(overlapCells);
    },
    [overlaps]
  );
  const [boardSubmitted, setBoardSubmitted] = useState(false);
  const [showVictory, setShowVictory] = useState(false);

  // Place AI ships if not already placed
  function placeAIShipsIfNeeded() {
    if (gameStateLocal.aiShips.length > 0) {
      return {
        aiShips: gameStateLocal.aiShips,
        aiBoard: gameStateLocal.aiBoard,
      };
    }

    // tempBoard enforces your “no-touch” adjacency rule
    const tempBoard = Array(10)
      .fill(0)
      .map(() => Array(10).fill(0));

    let newShips: Ship[];

    if (difficulty === "hard") {
      // heatmap-driven placement
      newShips = placeShipsByDifficulty(shipConfigs, 10, tempBoard).map(
        (p) => ({
          id: `ai-ship-${p.name}`,
          name: p.name,
          length: p.length,
          cells: p.cells,
        })
      );
    } else {
      // easy & medium: your existing random+no-touch logic
      newShips = shipConfigs.map((config, idx) => {
        const cells = findRandomShipPlacement(config.length, tempBoard)!;
        cells.forEach((c) => (tempBoard[c.y][c.x] = idx + 1));
        return {
          id: `ai-ship-${config.name}`,
          name: config.name,
          length: config.length,
          cells,
        };
      });
      // (no extra tweak needed for “easy”; “medium” still uses no-touch)
    }

    // Commit ships once
    setGameStateLocal((prev) => ({
      ...prev,
      aiShips: newShips,
      // aiBoard stays as-is (all zeros until shots land)
    }));

    return {
      aiShips: newShips,
      aiBoard: gameStateLocal.aiBoard,
    };
  }

  // Validate player ships: all 5 ships, correct lengths, no overlaps, all on board
  function validatePlayerShips(ships: Ship[]): boolean {
    if (ships.length !== 5) return false;
    const seen = new Set<string>();
    for (const config of shipConfigs) {
      const ship = ships.find((s) => s.name === config.name);
      if (!ship || ship.cells.length !== config.length) return false;
      for (const cell of ship.cells) {
        if (
          cell.x < 0 ||
          cell.x > 9 ||
          cell.y < 0 ||
          cell.y > 9 ||
          seen.has(`${cell.x},${cell.y}`)
        )
          return false;
        seen.add(`${cell.x},${cell.y}`);
      }
    }
    return true;
  }

  // Disable ready button if ships are overlapping or not placed correctly
  const disableReadyButton =
    gameStateLocal.ships.length !== 5 ||
    overlaps.length > 0 ||
    !validatePlayerShips(gameStateLocal.ships);

  // onReady: validate, place AI ships, start game
  const onReady = () => {
    if (!validatePlayerShips(gameStateLocal.ships)) return;
    const { aiShips, aiBoard } = placeAIShipsIfNeeded();
    setGameStateLocal((prev) => ({
      ...prev,
      aiShips,
      aiBoard,
      gameStatus: "ACTIVE",
      currentTurn: activeWallet || null,
    }));
    setBoardSubmitted(true);
    setGeneralMessage({ key: "game-start", id: Date.now() });
  };

  // Player fires at AI
  const makeShot = (x: number, y: number) => {
    if (
      gameStateLocal.gameStatus !== "ACTIVE" ||
      gameStateLocal.currentTurn !== activeWallet
    )
      return;
    if (gameStateLocal.aiBoard[y][x] !== 0) return;
    const aiShips = gameStateLocal.aiShips;
    let isHit = false;
    let sunkShipId: string | null = null;
    let sunkShipName: string | null = null;
    const newAIBoard = gameStateLocal.aiBoard.map((row) => [...row]);
    for (const ship of aiShips) {
      if (ship.cells.some((cell) => cell.x === x && cell.y === y)) {
        isHit = true;
        newAIBoard[y][x] = 2;
        // Check if ship is sunk
        const allHit = ship.cells.every(
          (cell) => newAIBoard[cell.y][cell.x] === 2
        );
        if (allHit) {
          sunkShipId = ship.id;
          sunkShipName = ship.name;
        }
        break;
      }
    }
    if (!isHit) newAIBoard[y][x] = 1;
    setGameStateLocal((prev) => {
      const newStats = { ...prev.playerStats! };
      newStats.shotsCount++;
      if (isHit) newStats.hitsCount++;
      newStats.accuracy = Math.round(
        (newStats.hitsCount / newStats.shotsCount) * 100
      );
      if (sunkShipId) newStats.shipsSunk++;
      return {
        ...prev,
        aiBoard: newAIBoard,
        playerStats: newStats,
        currentTurn: isHit ? activeWallet : "AI", // Only switch turn on miss
      };
    });
    // Set general message and play sound after UI update
    playSound(isHit ? "hit" : "miss");
    if (isHit) {
      if (sunkShipId && sunkShipName) {
        setGeneralMessage({
          key: "sunk",
          id: Date.now(),
          shipName: sunkShipName,
        });
      } else {
        setGeneralMessage({ key: "hit", id: Date.now() });
      }
    } else {
      setGeneralMessage({ key: "player-missed", id: Date.now() });
    }
    if (
      sunkShipId &&
      gameStateLocal.aiShips.every((ship) =>
        ship.cells.every((cell) => newAIBoard[cell.y][cell.x] === 2)
      )
    ) {
      setTimeout(() => endGame(activeWallet || null), 0);
      return;
    }
    if (!isHit) {
      // No need to schedule AI move here; useEffect above will handle it
    }
  };

  // --- AI Hunt State ---
  const [aiHuntTargets, setAiHuntTargets] = useState<
    { x: number; y: number }[]
  >([]);
  const [aiLastHits, setAiLastHits] = useState<{ x: number; y: number }[]>([]);

  // Utility: Get adjacent cells (up, down, left, right)
  function getAdjacentCells(x: number, y: number, board: number[][]) {
    const adj = [
      { x: x - 1, y },
      { x: x + 1, y },
      { x, y: y - 1 },
      { x, y: y + 1 },
    ];
    return adj.filter(
      (cell) =>
        cell.x >= 0 &&
        cell.x < 10 &&
        cell.y >= 0 &&
        cell.y < 10 &&
        (board[cell.y][cell.x] === 0 || board[cell.y][cell.x] > 0)
    );
  }

  // --- AI move timeout tracking ---
  const aiMoveTimeout = useRef<NodeJS.Timeout | null>(null);

  // Clear AI move timeout helper
  const clearAIMoveTimeout = () => {
    if (aiMoveTimeout.current) {
      clearTimeout(aiMoveTimeout.current);
      aiMoveTimeout.current = null;
    }
  };

  // --- Guarantee AI always gets a move when it's their turn ---
  useEffect(() => {
    if (
      gameStateLocal.currentTurn === "AI" &&
      gameStateLocal.gameStatus === "ACTIVE" &&
      !showVictory
    ) {
      clearAIMoveTimeout();
      aiMoveTimeout.current = setTimeout(() => {
        aiMove();
      }, Math.floor(Math.random() * 2000) + 1000); // 1-3s delay for realism
    }
    return () => {
      clearAIMoveTimeout();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStateLocal.currentTurn, gameStateLocal.gameStatus, showVictory]);

  // Clear AI move timeout on unmount, turn change, or game end
  useEffect(() => {
    return () => {
      clearAIMoveTimeout();
    };
  }, []);

  // --- AI fires at player (difficulty-based logic) ---

  function aiMove() {
    // Side-effect flags
    let hitThisTurn = false;
    let sunkShipId: string | null = null;
    let sunkShipName: string | null = null;
    let shotX = 0;
    let shotY = 0;

    // Flag to detect if AI just cleared every player ship
    let loseThisTurn = false;

    // ① Atomically update the game state off the freshest prev
    setGameStateLocal((prev) => {
      if (prev.gameStatus !== "ACTIVE" || prev.currentTurn !== "AI") {
        return prev;
      }

      const board = prev.playerBoard;
      let x = 0,
        y = 0,
        found = false;
      let huntTargets = aiHuntTargets.length ? [...aiHuntTargets] : [];
      let lastHits = aiLastHits.length ? [...aiLastHits] : [];
      const aiShipsLeft = prev.ships.filter(
        (ship) => !ship.cells.every((c) => board[c.y][c.x] === -2)
      );

      // Build a list of all still-unshot cells
      const allCoords: { x: number; y: number }[] = [];
      for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
          if (board[row][col] === 0 || board[row][col] > 0) {
            allCoords.push({ x: col, y: row });
          }
        }
      }

      // --- AI Difficulty Logic ---
      if (difficulty === "easy") {
        if (allCoords.length) {
          const idx = Math.floor(Math.random() * allCoords.length);
          ({ x, y } = allCoords[idx]);
          found = true;
        }
      } else if (difficulty === "medium") {
        if (huntTargets.length) {
          ({ x, y } = huntTargets.splice(
            Math.floor(Math.random() * huntTargets.length),
            1
          )[0]);
          found = true;
        } else {
          const parity = allCoords.filter((c) => (c.x + c.y) % 2 === 0);
          const pool = parity.length ? parity : allCoords;
          const idx = Math.floor(Math.random() * pool.length);
          ({ x, y } = pool[idx]);
          found = true;
        }
      } else if (difficulty === "hard") {
        // ——— your existing “hard” line-extend & adjacents logic ———
        if (lastHits.length > 1) {
          const [a, b] = lastHits.slice(-2);
          const dx = b.x - a.x,
            dy = b.y - a.y;
          const lineTargets: { x: number; y: number }[] = [];
          for (const dir of [-1, 1]) {
            let nx = b.x + dx * dir,
              ny = b.y + dy * dir;
            while (
              nx >= 0 &&
              nx < 10 &&
              ny >= 0 &&
              ny < 10 &&
              (board[ny][nx] === 0 || board[ny][nx] > 0)
            ) {
              lineTargets.push({ x: nx, y: ny });
              nx += dx * dir;
              ny += dy * dir;
            }
          }
          if (lineTargets.length) {
            const idx = Math.floor(Math.random() * lineTargets.length);
            ({ x, y } = lineTargets[idx]);
            found = true;
          }
        }
        if (!found && lastHits.length) {
          const adj: { x: number; y: number }[] = [];
          lastHits.forEach((hit) => {
            getAdjacentCells(hit.x, hit.y, board).forEach((c) => {
              if (
                (board[c.y][c.x] === 0 || board[c.y][c.x] > 0) &&
                !lastHits.some((h) => h.x === c.x && h.y === c.y)
              ) {
                adj.push(c);
              }
            });
          });
          if (adj.length) {
            const idx = Math.floor(Math.random() * adj.length);
            ({ x, y } = adj[idx]);
            found = true;
          }
        }
        if (!found) {
          const heat = Array.from({ length: 10 }, () =>
            Array.from({ length: 10 }, () => 0)
          );
          aiShipsLeft.forEach((ship) => {
            const len = ship.cells.length;
            for (let row = 0; row < 10; row++) {
              for (let col = 0; col < 10; col++) {
                // Horizontal
                if (col + len <= 10) {
                  let ok = true;
                  for (let i = 0; i < len; i++) {
                    if (
                      !(board[row][col + i] === 0 || board[row][col + i] > 0)
                    ) {
                      ok = false;
                      break;
                    }
                  }
                  if (ok) for (let i = 0; i < len; i++) heat[row][col + i]++;
                }
                // Vertical
                if (row + len <= 10) {
                  let ok = true;
                  for (let i = 0; i < len; i++) {
                    if (
                      !(board[row + i][col] === 0 || board[row + i][col] > 0)
                    ) {
                      ok = false;
                      break;
                    }
                  }
                  if (ok) for (let i = 0; i < len; i++) heat[row + i][col]++;
                }
              }
            }
          });
          let maxHeat = -1;
          allCoords.forEach((c) => {
            maxHeat = Math.max(maxHeat, heat[c.y][c.x]);
          });
          const best = allCoords.filter((c) => heat[c.y][c.x] === maxHeat);
          if (best.length) {
            const idx = Math.floor(Math.random() * best.length);
            ({ x, y } = best[idx]);
            found = true;
          }
        }
      }

      if (!found) {
        return prev;
      }

      // Capture the shot for side-effects
      shotX = x;
      shotY = y;

      // Clone & apply the shot
      const newBoard = board.map((r) => [...r]);
      const newStats = { ...prev.aiStats! };

      for (const ship of prev.ships) {
        if (ship.cells.some((c) => c.x === x && c.y === y)) {
          hitThisTurn = true;
          newBoard[y][x] = -2;
          const allHit = ship.cells.every((c) => newBoard[c.y][c.x] === -2);
          if (allHit) {
            sunkShipId = ship.id;
            sunkShipName = ship.name;
          }
          newStats.hitsCount++;
          break;
        }
      }
      if (!hitThisTurn) {
        newBoard[y][x] = -1;
      }
      newStats.shotsCount++;
      newStats.accuracy = Math.round(
        (newStats.hitsCount / newStats.shotsCount) * 100
      );

      // Maintain hunt state for medium & hard
      if ((difficulty === "medium" || difficulty === "hard") && hitThisTurn) {
        lastHits.push({ x, y });
        if (sunkShipId) {
          lastHits = [];
          huntTargets = [];
        } else if (difficulty === "medium") {
          getAdjacentCells(x, y, newBoard).forEach((c) => {
            if (
              !huntTargets.some((h) => h.x === c.x && h.y === c.y) &&
              (newBoard[c.y][c.x] === 0 || newBoard[c.y][c.x] > 0)
            ) {
              huntTargets.push(c);
            }
          });
        }
      }

      // Persist hunt arrays
      setAiHuntTargets(huntTargets);
      setAiLastHits(lastHits);

      // Check if AI just sank all player ships
      const allSunk = prev.ships.every((ship) =>
        ship.cells.every((c) => newBoard[c.y][c.x] === -2)
      );
      if (allSunk) {
        loseThisTurn = true;
      }

      // Pass turn back (AI repeats on hit)
      const nextTurn = hitThisTurn ? "AI" : activeWallet || null;
      return {
        ...prev,
        playerBoard: newBoard,
        aiStats: newStats,
        currentTurn: nextTurn,
      };
    });

    // ① .5 If AI just cleared the board, end the match immediately
    if (loseThisTurn) {
      endGame("AI");
      return;
    }

    // ② Fire audio + UI in lock-step
    playSound(hitThisTurn ? "hit" : "miss");
    if (hitThisTurn) {
      if (sunkShipId && sunkShipName) {
        setGeneralMessage({
          key: "opponent-sunk",
          id: Date.now(),
          shipName: sunkShipName,
        });
      } else {
        setGeneralMessage({ key: "opponent-hit", id: Date.now() });
      }
    } else {
      setGeneralMessage({ key: "missed", id: Date.now() });
    }

    // ③ If hit, queue the next AI strike
    if (hitThisTurn) {
      clearAIMoveTimeout();
      aiMoveTimeout.current = setTimeout(
        aiMove,
        Math.floor(Math.random() * 2000) + 1000
      );
    }
  }

  function endGame(winner: string | null) {
    // 1️⃣ Play the same win/draw/lose voiceover as the multiplayer hook
    if (!winner) {
      audio?.play("game_draw_restart_voiceover");
    } else if (winner === activeWallet) {
      audio?.play("you_won_voiceover");
    } else {
      audio?.play("you_lost_voiceover");
    }

    // 2️⃣ Mark the game as completed & show the victory UI
    setGameStateLocal((prev) => ({
      ...prev,
      gameStatus: "COMPLETED",
      winner,
    }));
    setShowVictory(true);
  }

  const mode: "setup" | "game" =
    gameStateLocal.gameStatus === "ACTIVE" ? "game" : "setup";
  const yourTurn = gameStateLocal.currentTurn === activeWallet;
  const selfAddress = activeWallet ?? "";
  const aiOpponent = AI_OPPONENTS[difficulty] || {
    name: "AI",
    avatarUrl: "",
    difficulty,
  };
  const playerStatus = getPlayerStatus({
    gameStatus: gameStateLocal.gameStatus,
    hasSubmitted: gameStateLocal.ships.length === 5,
    isSelf: true,
  });
  const opponentStatus = getPlayerStatus({
    gameStatus: gameStateLocal.gameStatus,
    hasSubmitted: gameStateLocal.aiShips.length === 5,
    isSelf: false,
  });
  const handlePlayAgain = () => navigate.replace("/");

  // --- Multiplayer-identical board adapters ---
  const allowedVariants = [
    "Carrier",
    "Battleship",
    "Cruiser",
    "Submarine",
    "Destroyer",
  ] as const;
  type Variant = (typeof allowedVariants)[number];

  function getOrientation(
    cells: { x: number; y: number }[]
  ): "horizontal" | "vertical" {
    if (cells.length < 2) return "horizontal";
    return cells[0].y === cells[1].y ? "horizontal" : "vertical";
  }

  function boardArrayToRecord(
    board: number[][],
    isPlayer: boolean = false
  ): Record<string, "ship" | "hit" | "miss" | null> {
    const result: Record<string, "ship" | "hit" | "miss" | null> = {};
    for (let y = 0; y < board.length; y++) {
      for (let x = 0; x < board[y].length; x++) {
        const val = board[y][x];
        const key = `${x}-${y}`;
        if (isPlayer) {
          if (val > 0) result[key] = "ship";
          else if (val === -2) result[key] = "hit";
          else if (val === -1) result[key] = "miss";
          else result[key] = null;
        } else {
          if (val === 2) result[key] = "hit";
          else if (val === 1) result[key] = "miss";
          else result[key] = null;
        }
      }
    }
    return result;
  }

  const playerBoard = boardArrayToRecord(gameStateLocal.playerBoard, true);
  // For opponentBoard, filter out 'ship' values to match expected type
  const rawOpponentBoard = boardArrayToRecord(gameStateLocal.aiBoard, false);
  const opponentBoard: Record<string, "hit" | "miss" | null> = {};
  Object.entries(rawOpponentBoard).forEach(([k, v]) => {
    opponentBoard[k] = v === "hit" || v === "miss" ? v : null;
  });

  // --- PLAYER SHIPS: update hitMap based on playerBoard ---
  const placedShips = gameStateLocal.ships
    .filter((ship) => allowedVariants.includes(ship.name as Variant))
    .map((ship) => {
      const orientation = getOrientation(ship.cells);
      const position = ship.cells[0];
      // Build hitMap from playerBoard
      const hitMap = ship.cells.map((cell) => {
        const val = gameStateLocal.playerBoard[cell.y]?.[cell.x];
        return val === -2; // -2 means hit
      });
      return {
        id: ship.id,
        variant: ship.name as Variant,
        orientation,
        position,
        hitMap,
      };
    });

  // --- Add sunkEnemyShips state for AI session, like in multiplayer ---
  const [sunkEnemyShips, setSunkEnemyShips] = useState<
    {
      id: string;
      name: string;
      cells: { x: number; y: number }[];
    }[]
  >([]);

  // --- When a ship is sunk, add to sunkEnemyShips (AI ships) ---
  useEffect(() => {
    if (gameStateLocal.gameStatus !== "ACTIVE") return;
    // For each AI ship, if all cells are hit and not already in sunkEnemyShips, add it
    gameStateLocal.aiShips.forEach((ship) => {
      const isSunk = ship.cells.every(
        (cell) => gameStateLocal.aiBoard[cell.y][cell.x] === 2
      );
      const alreadySunk = sunkEnemyShips.some((s) => s.id === ship.id);
      if (isSunk && !alreadySunk) {
        setSunkEnemyShips((prev) => [
          ...prev,
          { id: ship.id, name: ship.name, cells: ship.cells },
        ]);
      }
    });
  }, [
    gameStateLocal.aiBoard,
    gameStateLocal.aiShips,
    gameStateLocal.gameStatus,
    sunkEnemyShips,
  ]);

  // --- OPPONENT SHIPS: show sunk enemy ships with all hitMap true ---
  const opponentShips = sunkEnemyShips.map((ship) => {
    const orientation = getOrientation(ship.cells);
    const position = ship.cells[0];
    return {
      id: ship.id,
      variant: ship.name as Variant,
      orientation,
      position,
      hitMap: Array(ship.cells.length).fill(true),
    };
  });

  // currentTurn for GameBoardContainer
  const currentTurn = gameStateLocal.currentTurn
    ? {
        playerId: gameStateLocal.currentTurn,
        isMyTurn: gameStateLocal.currentTurn === activeWallet,
      }
    : null;

  // victoryStatus for VictoryStatus
  let victoryStatus: "win" | "draw" | "loss" | undefined = undefined;
  if (showVictory) {
    if (gameStateLocal.winner === activeWallet) victoryStatus = "win";
    else if (gameStateLocal.winner === null) victoryStatus = "draw";
    else victoryStatus = "loss";
  }

  // playerStats for VictoryStatus
  const playerStats = {
    address: activeWallet || "",
    shotsCount: gameStateLocal.playerStats?.shotsCount || 0,
    hitsCount: gameStateLocal.playerStats?.hitsCount || 0,
    accuracy: gameStateLocal.playerStats?.accuracy || 0,
    shipsSunk: gameStateLocal.playerStats?.shipsSunk || 0,
    avgTurnTime: gameStateLocal.playerStats?.avgTurnTime || 0,
  };

  // On first load, randomly place player ships (but do not start the game)
  useEffect(() => {
    if (
      gameStateLocal.ships.length === 0 &&
      gameStateLocal.playerBoard.every((row) => row.every((cell) => cell === 0))
    ) {
      const board = Array(10)
        .fill(0)
        .map(() => Array(10).fill(0));
      const newShips: Ship[] = [];
      shipConfigs.forEach((config, idx) => {
        const cells = findRandomShipPlacement(config.length, board);
        if (cells) {
          cells.forEach((cell) => {
            board[cell.y][cell.x] = idx + 1;
          });
          newShips.push({
            id: `ship-${config.name}`,
            name: config.name,
            length: config.length,
            cells,
          });
        }
      });
      setGameStateLocal((prev) => ({
        ...prev,
        ships: newShips,
        playerBoard: board,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update ship position by id
  const updateShipPosition = (id: string, pos: { x: number; y: number }) => {
    setGameStateLocal((prev) => ({
      ...prev,
      ships: prev.ships.map((ship) =>
        ship.id === id
          ? {
              ...ship,
              cells: ship.cells.map((cell, idx) => ({
                x: pos.x + (ship.cells[idx].x - ship.cells[0].x),
                y: pos.y + (ship.cells[idx].y - ship.cells[0].y),
              })),
            }
          : ship
      ),
    }));
    playSound("place");
  };

  // Flip ship orientation by id
  const flipShip = (id: string) => {
    setGameStateLocal((prev) => ({
      ...prev,
      ships: prev.ships.map((ship) => {
        if (ship.id !== id) return ship;
        const length = ship.cells.length;
        const base = { ...ship.cells[0] };
        const isHorizontal = length > 1 && ship.cells[0].y === ship.cells[1].y;
        // Adjust base to keep ship in bounds after flip
        if (isHorizontal) {
          // Flipping to vertical
          if (base.y + length > 10) base.y = 10 - length;
        } else {
          // Flipping to horizontal
          if (base.x + length > 10) base.x = 10 - length;
        }
        const newCells = Array.from({ length }).map(
          (_, idx) =>
            isHorizontal
              ? { x: base.x, y: base.y + idx } // to vertical
              : { x: base.x + idx, y: base.y } // to horizontal
        );
        return { ...ship, cells: newCells };
      }),
    }));
    playSound("place");
  };

  return {
    gameStateLocal,
    setGameStateLocal,
    messages,
    loadingDone,
    generalMessage,
    setGeneralMessage,
    playerStatus,
    opponentStatus,
    mode,
    yourTurn,
    selfAddress,
    aiOpponent,
    showVictory,
    setShowVictory,
    playerBoard,
    opponentBoard,
    placedShips,
    opponentShips,
    currentTurn,
    victoryStatus,
    playerStats,
    onReady,
    makeShot,
    handlePlayAgain,
    disableReadyButton,
    infoShow,
    setUserDismissedInfo,
    overlaps,
    handleOverlap,
    updateShipPosition,
    flipShip,
    opponentAddress: "AI",
    boardSubmitted,
  };
};

export default useAIGameSession;
