import { axiosInstance } from '../../utils/axios';
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
  PointsStats
} from './types';

export interface PlayerAPI {
  // Player profile endpoints
  createProfile: (data: CreateProfileRequest) => Promise<CreateProfileResponse>;
  getProfile: (address: string) => Promise<PlayerProfile>;
  updateProfile: (address: string, data: UpdateProfileRequest) => Promise<UpdateProfileResponse>;
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
    const response = await axiosInstance.post<CreateProfileResponse>('/api/players/create-profile', data);
    return response.data;
  },

  getProfile: async (address: string) => {
    const response = await axiosInstance.get<PlayerProfile>(`/api/players/${address}`);
    return response.data;
  },

  updateProfile: async (address: string, data: UpdateProfileRequest) => {
    const response = await axiosInstance.put<UpdateProfileResponse>(`/api/players/${address}/profile`, data);
    return response.data;
  },

  getOngoingSessions: async (address: string) => {
    const response = await axiosInstance.get<GetOngoingSessionsResponse>(`/api/players/${address}/ongoing-sessions`);
    return response.data;
  },

  // Rewards and points endpoints
  getPlayerRewards: async (address: string) => {
    const response = await axiosInstance.get<PlayerRewards>(`/api/players/${address}/rewards`);
    return response.data;
  },

  getPlayerPoints: async (address: string) => {
    const response = await axiosInstance.get<PlayerPointsResponse>(`/api/points/player/${address}`);
    return response.data;
  },

  getLeaderboard: async () => {
    const response = await axiosInstance.get<Leaderboard>('/api/points/leaderboard');
    return response.data;
  },

  getWeeklyLeaderboard: async () => {
    const response = await axiosInstance.get<WeeklyLeaderboard>('/api/points/leaderboard/weekly');
    return response.data;
  },

  getPointsDistribution: async () => {
    const response = await axiosInstance.get<PointsDistribution>('/api/points/distribution');
    return response.data;
  },

  getPointsStats: async () => {
    const response = await axiosInstance.get<PointsStats>('/api/points/stats');
    return response.data;
  }
};