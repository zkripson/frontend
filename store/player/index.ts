import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  PlayerProfile,
  OngoingSession,
  PlayerRewards,
  Leaderboard,
  WeeklyLeaderboard,
  PointsDistribution,
  PointsStats,
  PlayerPointsResponse,
} from "./types";

export interface PlayerState {
  // Profile data
  playerProfile: PlayerProfile | null;
  opponentProfile: PlayerProfile | null;
  ongoingSessions: OngoingSession[];

  // Rewards and points data
  playerRewards: PlayerRewards | null;
  playerPoints: PlayerPointsResponse | null;
  leaderboard: Leaderboard | null;
  weeklyLeaderboard: WeeklyLeaderboard | null;
  pointsDistribution: PointsDistribution | null;
  pointsStats: PointsStats | null;

  // Loading state flags
  loading: {
    createProfile: boolean;
    getProfile: boolean;
    getOpponentProfile: boolean;
    updateProfile: boolean;
    getOngoingSessions: boolean;
    getPlayerRewards: boolean;
    getPlayerPoints: boolean;
    getLeaderboard: boolean;
    getWeeklyLeaderboard: boolean;
    getPointsDistribution: boolean;
    getPointsStats: boolean;
  };
}

const initialState: PlayerState = {
  // Profile data
  playerProfile: null,
  opponentProfile: null,
  ongoingSessions: [
    {
      sessionId: "sess-001",
      status: "active",
      createdAt: Date.now() - 5 * 60_000, // 5 minutes ago
      creator: "0xABC123...",
      opponent: "0xDEF456...",
      isBettingGame: false,
      stakeAmount: null,
    },
    {
      sessionId: "sess-002",
      status: "waiting",
      createdAt: Date.now() - 15 * 60_000, // 15 minutes ago
      creator: "0x7890AB...",
      opponent: null,
      isBettingGame: true,
      stakeAmount: "10.00",
    },
    {
      sessionId: "sess-003",
      status: "active",
      createdAt: Date.now() - 30 * 60_000, // 30 minutes ago
      creator: "0x111AAA...",
      opponent: "0x222BBB...",
      isBettingGame: true,
      stakeAmount: "5.00",
    },
    {
      sessionId: "sess-004",
      status: "active",
      createdAt: Date.now() - 2 * 60_000, // 2 minutes ago
      creator: "0x333CCC...",
      opponent: "0x444DDD...",
      isBettingGame: false,
      stakeAmount: null,
    },
    {
      sessionId: "sess-005",
      status: "waiting",
      createdAt: Date.now() - 60 * 60_000, // 1 hour ago
      creator: "0x555EEE...",
      opponent: null,
      isBettingGame: true,
      stakeAmount: "20.00",
    },
  ],

  // Rewards and points data
  playerRewards: null,
  playerPoints: null,
  leaderboard: null,
  weeklyLeaderboard: null,
  pointsDistribution: null,
  pointsStats: null,

  // Loading state flags
  loading: {
    createProfile: false,
    getProfile: false,
    getOpponentProfile: false,
    updateProfile: false,
    getOngoingSessions: false,
    getPlayerRewards: false,
    getPlayerPoints: false,
    getLeaderboard: false,
    getWeeklyLeaderboard: false,
    getPointsDistribution: false,
    getPointsStats: false,
  },
};

const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    // Loading state actions
    setCreateProfileLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.createProfile = action.payload;
    },
    setGetProfileLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.getProfile = action.payload;
    },
    setUpdateProfileLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.updateProfile = action.payload;
    },
    setGetOngoingSessionsLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.getOngoingSessions = action.payload;
    },
    setGetPlayerRewardsLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.getPlayerRewards = action.payload;
    },
    setGetPlayerPointsLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.getPlayerPoints = action.payload;
    },
    setGetLeaderboardLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.getLeaderboard = action.payload;
    },
    setGetWeeklyLeaderboardLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.getWeeklyLeaderboard = action.payload;
    },
    setGetPointsDistributionLoading: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.loading.getPointsDistribution = action.payload;
    },
    setGetPointsStatsLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.getPointsStats = action.payload;
    },
    setGetOpponentProfileLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.getOpponentProfile = action.payload;
    },

    // Data update actions
    setPlayerProfile: (state, action: PayloadAction<PlayerProfile>) => {
      state.playerProfile = action.payload;
    },
    setOngoingSessions: (state, action: PayloadAction<OngoingSession[]>) => {
      state.ongoingSessions = action.payload;
    },
    setPlayerRewards: (state, action: PayloadAction<PlayerRewards>) => {
      state.playerRewards = action.payload;
    },
    setPlayerPoints: (state, action: PayloadAction<PlayerPointsResponse>) => {
      state.playerPoints = action.payload;
    },
    setLeaderboard: (state, action: PayloadAction<Leaderboard>) => {
      state.leaderboard = action.payload;
    },
    setWeeklyLeaderboard: (state, action: PayloadAction<WeeklyLeaderboard>) => {
      state.weeklyLeaderboard = action.payload;
    },
    setPointsDistribution: (
      state,
      action: PayloadAction<PointsDistribution>
    ) => {
      state.pointsDistribution = action.payload;
    },
    setPointsStats: (state, action: PayloadAction<PointsStats>) => {
      state.pointsStats = action.payload;
    },
    setOpponentProfile: (state, action: PayloadAction<PlayerProfile>) => {
      state.opponentProfile = action.payload;
    },

    // Reset actions
    resetPlayerState: (state) => {
      return initialState;
    },
  },
});

export const {
  // Loading state actions
  setCreateProfileLoading,
  setGetProfileLoading,
  setUpdateProfileLoading,
  setGetOngoingSessionsLoading,
  setGetPlayerRewardsLoading,
  setGetPlayerPointsLoading,
  setGetLeaderboardLoading,
  setGetWeeklyLeaderboardLoading,
  setGetPointsDistributionLoading,
  setGetPointsStatsLoading,
  setGetOpponentProfileLoading,

  // Data update actions
  setPlayerProfile,
  setOngoingSessions,
  setPlayerRewards,
  setPlayerPoints,
  setLeaderboard,
  setWeeklyLeaderboard,
  setPointsDistribution,
  setPointsStats,
  setOpponentProfile,

  // Reset actions
  resetPlayerState,
} = playerSlice.actions;

export default playerSlice.reducer;
