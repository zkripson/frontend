import { useDispatch } from 'react-redux';
import { playerApi } from './api';
import { 
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
  setPlayerProfile,
  setOngoingSessions,
  setPlayerRewards,
  setPlayerPoints,
  setLeaderboard,
  setWeeklyLeaderboard,
  setPointsDistribution,
  setPointsStats
} from './index';
import { useSystemFunctions } from '../../hooks/useSystemFunctions';
import { usePrivyLinkedAccounts } from '../../hooks/usePrivyLinkedAccounts';
import { 
  CreateProfileRequest, 
  PlayerProfile, 
  UpdateProfileRequest 
} from './types';

interface CallbackProps {
  onSuccess?: (...args: any[]) => void;
  onError?: (error: Error) => void;
}

export const usePlayerActions = () => {
  const dispatch = useDispatch();
  const { handleError } = useSystemFunctions();
  const { address } = usePrivyLinkedAccounts();

  // Profile actions
  const createProfile = async (data: CreateProfileRequest, callbacks?: CallbackProps) => {
    try {
      dispatch(setCreateProfileLoading(true));
      const response = await playerApi.createProfile(data);
      dispatch(setPlayerProfile(response.profile));
      callbacks?.onSuccess?.(response);
      return response;
    } catch (err) {
      const error = err as Error;
      handleError(error);
      callbacks?.onError?.(error);
      throw error;
    } finally {
      dispatch(setCreateProfileLoading(false));
    }
  };

  const getProfile = async (playerAddress: string = address, callbacks?: CallbackProps) => {
    try {
      dispatch(setGetProfileLoading(true));
      const profile = await playerApi.getProfile(playerAddress);
      dispatch(setPlayerProfile(profile));
      callbacks?.onSuccess?.(profile);
      return profile;
    } catch (err) {
      const error = err as Error;
      handleError(error);
      callbacks?.onError?.(error);
      throw error;
    } finally {
      dispatch(setGetProfileLoading(false));
    }
  };

  const updateProfile = async (data: UpdateProfileRequest, playerAddress: string = address, callbacks?: CallbackProps) => {
    try {
      dispatch(setUpdateProfileLoading(true));
      const response = await playerApi.updateProfile(playerAddress, data);
      dispatch(setPlayerProfile(response.profile));
      callbacks?.onSuccess?.(response);
      return response;
    } catch (err) {
      const error = err as Error;
      handleError(error);
      callbacks?.onError?.(error);
      throw error;
    } finally {
      dispatch(setUpdateProfileLoading(false));
    }
  };

  const getOngoingSessions = async (playerAddress: string = address, callbacks?: CallbackProps) => {
    try {
      dispatch(setGetOngoingSessionsLoading(true));
      const response = await playerApi.getOngoingSessions(playerAddress);
      dispatch(setOngoingSessions(response.ongoingSessions));
      callbacks?.onSuccess?.(response);
      return response;
    } catch (err) {
      const error = err as Error;
      handleError(error);
      callbacks?.onError?.(error);
      throw error;
    } finally {
      dispatch(setGetOngoingSessionsLoading(false));
    }
  };

  // Rewards and points actions
  const getPlayerRewards = async (playerAddress: string = address, callbacks?: CallbackProps) => {
    try {
      dispatch(setGetPlayerRewardsLoading(true));
      const rewards = await playerApi.getPlayerRewards(playerAddress);
      dispatch(setPlayerRewards(rewards));
      callbacks?.onSuccess?.(rewards);
      return rewards;
    } catch (err) {
      const error = err as Error;
      handleError(error);
      callbacks?.onError?.(error);
      throw error;
    } finally {
      dispatch(setGetPlayerRewardsLoading(false));
    }
  };

  const getPlayerPoints = async (playerAddress: string = address, callbacks?: CallbackProps) => {
    try {
      dispatch(setGetPlayerPointsLoading(true));
      const points = await playerApi.getPlayerPoints(playerAddress);
      dispatch(setPlayerPoints(points));
      callbacks?.onSuccess?.(points);
      return points;
    } catch (err) {
      const error = err as Error;
      handleError(error);
      callbacks?.onError?.(error);
      throw error;
    } finally {
      dispatch(setGetPlayerPointsLoading(false));
    }
  };

  const getLeaderboard = async (callbacks?: CallbackProps) => {
    try {
      dispatch(setGetLeaderboardLoading(true));
      const leaderboard = await playerApi.getLeaderboard();
      dispatch(setLeaderboard(leaderboard));
      callbacks?.onSuccess?.(leaderboard);
      return leaderboard;
    } catch (err) {
      const error = err as Error;
      handleError(error);
      callbacks?.onError?.(error);
      throw error;
    } finally {
      dispatch(setGetLeaderboardLoading(false));
    }
  };

  const getWeeklyLeaderboard = async (callbacks?: CallbackProps) => {
    try {
      dispatch(setGetWeeklyLeaderboardLoading(true));
      const weeklyLeaderboard = await playerApi.getWeeklyLeaderboard();
      dispatch(setWeeklyLeaderboard(weeklyLeaderboard));
      callbacks?.onSuccess?.(weeklyLeaderboard);
      return weeklyLeaderboard;
    } catch (err) {
      const error = err as Error;
      handleError(error);
      callbacks?.onError?.(error);
      throw error;
    } finally {
      dispatch(setGetWeeklyLeaderboardLoading(false));
    }
  };

  const getPointsDistribution = async (callbacks?: CallbackProps) => {
    try {
      dispatch(setGetPointsDistributionLoading(true));
      const distribution = await playerApi.getPointsDistribution();
      dispatch(setPointsDistribution(distribution));
      callbacks?.onSuccess?.(distribution);
      return distribution;
    } catch (err) {
      const error = err as Error;
      handleError(error);
      callbacks?.onError?.(error);
      throw error;
    } finally {
      dispatch(setGetPointsDistributionLoading(false));
    }
  };

  const getPointsStats = async (callbacks?: CallbackProps) => {
    try {
      dispatch(setGetPointsStatsLoading(true));
      const stats = await playerApi.getPointsStats();
      dispatch(setPointsStats(stats));
      callbacks?.onSuccess?.(stats);
      return stats;
    } catch (err) {
      const error = err as Error;
      handleError(error);
      callbacks?.onError?.(error);
      throw error;
    } finally {
      dispatch(setGetPointsStatsLoading(false));
    }
  };

  return {
    // Profile actions
    createProfile,
    getProfile,
    updateProfile,
    getOngoingSessions,
    
    // Rewards and points actions
    getPlayerRewards,
    getPlayerPoints,
    getLeaderboard,
    getWeeklyLeaderboard,
    getPointsDistribution,
    getPointsStats,
  };
};