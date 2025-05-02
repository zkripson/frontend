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
  success: boolean;
  player: string;
  allBoardsSubmitted: boolean;
  gameStatus: string;
};

type StartGame = {
  success: boolean;
  status: string;
  currentTurn: string;
  gameContractAddress: string | null;
  gameId: string | null;
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

type RegisterGameContract = {
  success: boolean;
  sessionId: string;
  status: string;
  gameContractAddress: string;
  gameId: string;
};
