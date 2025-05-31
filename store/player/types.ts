import { Address } from "viem";

// Player profile types
export interface PlayerPreferences {
  theme: string;
  notifications: boolean;
  soundEnabled: boolean;
  animationsEnabled: boolean;
  autoSubmitOnHit: boolean;
}

export interface GameHistoryItem {
  gameId: string;
  sessionId: string;
  opponent: string;
  startTime: number;
  endTime: number;
  outcome: string;
  gameDuration: number;
  shipsDestroyed: number;
  shotsFired: number;
  accuracy: number;
}

export interface PlayerProfile {
  address: string;
  username: string;
  avatar: string;
  createdAt: number;
  lastActive?: number;
  totalGames: number;
  wins: number;
  losses: number;
  gameHistory?: GameHistoryItem[];
  preferences: PlayerPreferences;
  channel?: "twitter" | "farcaster";
}

export interface OngoingSession {
  sessionId: string;
  status: string;
  createdAt: number;
  creator: string;
  opponent: string | null;
  isBettingGame: boolean;
  stakeAmount: string | null;
}

export interface ClaimHistoryItem {
  date: string;
  amount: string;
  transactionHash: string;
  week: number;
}

export interface PlayerStreak {
  currentDays: number;
  type: string;
  lastClaimDate: string;
  nextClaimDate: string;
}

export interface ReferralPoints {
  earned: string;
  pending: string;
}

export interface ClaimStatus {
  canClaim: boolean;
  nextClaimDate: string;
  reason: string | null;
}

export interface PlayerRewards {
  player: string;
  totalPoints: string;
  weeklyPoints: string;
  claimablePoints: string;
  referralPoints: ReferralPoints;
  streak: PlayerStreak;
  claimHistory: ClaimHistoryItem[];
  claimStatus: ClaimStatus;
}

export interface LeaderboardEntry {
  player: string;
  points: number;
  rank: number;
}

export interface Leaderboard {
  leaderboard: LeaderboardEntry[];
  lastUpdated: number;
  totalPlayers: number;
}

export interface WeeklyLeaderboard {
  leaderboard: LeaderboardEntry[];
  currentWeek: number;
  weekEndsAt: number;
  activePlayerCount: number;
}

export interface PointsDistribution {
  currentWeek: number;
  weekStart: string;
  weekEnd: string;
  timeUntilSnapshot: number;
  nextDistribution: string;
  isSnapshotTaken: boolean;
  canClaimRewards: boolean;
}

export interface PointsStats {
  totalPointsAwarded: number;
  totalPlayers: number;
  activePlayersThisWeek: number;
  topCategory: string;
  minimumThreshold: number;
  weeklyRewardPool: string;
  distributionEnabled: boolean;
}

// API request/response types
export interface CreateProfileRequest {
  address: string;
  username: string;
  avatar: string;
  preferences: PlayerPreferences;
  channel: "twitter" | "farcaster";
}

export interface CreateProfileResponse {
  success: boolean;
  message: string;
  profile: PlayerProfile;
}

export interface UpdateProfileRequest {
  username?: string;
  avatar?: string;
  preferences?: Partial<PlayerPreferences>;
  channel?: "twitter" | "farcaster";
}

export interface UpdateProfileResponse {
  success: boolean;
  profile: PlayerProfile;
}

export interface GetOngoingSessionsResponse {
  ongoingSessions: OngoingSession[];
}

export interface PlayerPointsResponse {
  player: string;
  totalPoints: number;
  weeklyPoints: number;
  claimablePoints: number;
  lastUpdated: number;
}
