type GameSession = {
  createdAt: number;
  creator: string;
  sessionId: string;
  status: string;
};

type GameSessionInformation = {
  sessionId: string;
  status: string;
  players: string[];
  currentTurn: string | null;
  gameContractAddress: string | null;
  gameId: string | null;
  turnStartedAt: number | null;
  createdAt: number;
  lastActivityAt: number;
};

type JoinSession = {
  success: boolean;
  sessionId: string;
  status: string;
  players: string[];
};

type BoardCommitment = {
  address: string;
  ships: Ship[];
  boardCommitment: string;
};

type BoardCommitmentResponse = {
  success: boolean;
  allBoardsSubmitted: boolean;
  gameStatus: string;
};

type Ship = {
  id: string;
  length: number;
  name: string;
  cells: {
    x: number;
    y: number;
  }[];
};

type ForfeitGame = {
  success: boolean;
  status: string;
  winner: string;
};

enum ForfeitGameReason {
  TIMEOUT = "TIMEOUT",
  PLAYER_QUIT = "PLAYER_QUIT",
  TECHNICAL_ISSUE = "TECHNICAL_ISSUE",
  CHEATING_DETECTED = "CHEATING_DETECTED",
}

type MakeShot = {
  address: string;
  x: number;
  y: number;
};

type MakeShotResponse = {
  isHit: boolean;
  nextTurn: string;
  shipSunk: boolean;
  success: boolean;
  sunkShips: string[];
};
