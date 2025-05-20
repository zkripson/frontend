import { axiosInstance } from "../../utils/axios";
import {
  CreateProfileRequest,
  CreateProfileResponse,
  GetOngoingSessionsResponse,
  PlayerPointsResponse,
  PlayerProfile,
  PlayerRewards,
  UpdateProfileRequest,
  UpdateProfileResponse,
  Leaderboard,
  WeeklyLeaderboard,
  PointsDistribution,
  PointsStats,
} from "./types";

export interface PlayerAPI {
  // Player profile endpoints
  createProfile: (data: CreateProfileRequest) => Promise<CreateProfileResponse>;
  getProfile: (address: string) => Promise<PlayerProfile>;
  updateProfile: (
    address: string,
    data: UpdateProfileRequest
  ) => Promise<UpdateProfileResponse>;
  getOngoingSessions: (address: string) => Promise<GetOngoingSessionsResponse>;

  // Rewards and points endpoints
  getPlayerRewards: (address: string) => Promise<PlayerRewards>;
  getPlayerPoints: (address: string) => Promise<PlayerPointsResponse>;
  getLeaderboard: () => Promise<Leaderboard>;
  getWeeklyLeaderboard: () => Promise<WeeklyLeaderboard>;
  getPointsDistribution: () => Promise<PointsDistribution>;
  getPointsStats: () => Promise<PointsStats>;
}

export const playerApi: PlayerAPI = {
  // Player profile endpoints
  createProfile: async (data: CreateProfileRequest) => {
    const response = await axiosInstance.post<CreateProfileResponse>(
      "players/create-profile",
      data
    );
    return response.data;
  },

  getProfile: async (address: string) => {
    const response = await axiosInstance.get<PlayerProfile>(
      `players/${address}`
    );
    return response.data;
  },

  updateProfile: async (address: string, data: UpdateProfileRequest) => {
    const response = await axiosInstance.put<UpdateProfileResponse>(
      `players/${address}/profile`,
      data
    );
    return response.data;
  },

  getOngoingSessions: async (address: string) => {
    const response = await axiosInstance.get<GetOngoingSessionsResponse>(
      `players/${address}/ongoing-sessions`
    );
    return response.data;
  },

  // Rewards and points endpoints
  getPlayerRewards: async (address: string) => {
    const response = await axiosInstance.get<PlayerRewards>(
      `players/${address}/rewards`
    );
    return response.data;
  },

  getPlayerPoints: async (address: string) => {
    const response = await axiosInstance.get<PlayerPointsResponse>(
      `points/player/${address}`
    );
    return response.data;
  },

  getLeaderboard: async () => {
    const response = await axiosInstance.get<Leaderboard>("points/leaderboard");
    return response.data;
  },

  getWeeklyLeaderboard: async () => {
    const response = await axiosInstance.get<WeeklyLeaderboard>(
      "points/leaderboard/weekly"
    );
    return response.data;
  },

  getPointsDistribution: async () => {
    const response = await axiosInstance.get<PointsDistribution>(
      "points/distribution"
    );
    return response.data;
  },

  getPointsStats: async () => {
    const response = await axiosInstance.get<PointsStats>("points/stats");
    return response.data;
  },
};
