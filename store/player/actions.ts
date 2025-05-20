import { useDispatch } from "react-redux";
import { playerApi } from "./api";
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
  setPointsStats,
} from "./index";
import { CreateProfileRequest, UpdateProfileRequest } from "./types";
import useAppActions from "../app/actions";
import { CallbackProps } from "..";
import usePrivyLinkedAccounts from "@/hooks/usePrivyLinkedAccounts";

export const usePlayerActions = () => {
  const dispatch = useDispatch();
  const { activeWallet } = usePrivyLinkedAccounts();

  // Profile actions
  const createProfile = async (
    data: CreateProfileRequest,
    callbacks?: CallbackProps
  ) => {
    try {
      dispatch(setCreateProfileLoading(true));
      const response = await playerApi.createProfile(data);
      dispatch(setPlayerProfile(response.profile));
      callbacks?.onSuccess?.(response);

      getPlayerRewards();
      return response;
    } catch (err) {
      console.log(err);
      callbacks?.onError?.(err);
    } finally {
      dispatch(setCreateProfileLoading(false));
    }
  };

  const getProfile = async (callbacks?: CallbackProps) => {
    try {
      if (!activeWallet?.address) return;

      dispatch(setGetProfileLoading(true));
      const profile = await playerApi.getProfile(activeWallet.address);
      dispatch(setPlayerProfile(profile));
      callbacks?.onSuccess?.(profile);
      return profile;
    } catch (err) {
      callbacks?.onError?.(err);
    } finally {
      dispatch(setGetProfileLoading(false));
    }
  };

  const updateProfile = async (
    data: UpdateProfileRequest,
    callbacks?: CallbackProps
  ) => {
    try {
      if (!activeWallet?.address) return;

      dispatch(setUpdateProfileLoading(true));
      const response = await playerApi.updateProfile(
        activeWallet.address,
        data
      );
      dispatch(setPlayerProfile(response.profile));
      callbacks?.onSuccess?.(response);
      return response;
    } catch (err) {
      callbacks?.onError?.(err);
    } finally {
      dispatch(setUpdateProfileLoading(false));
    }
  };

  const getOngoingSessions = async (callbacks?: CallbackProps) => {
    try {
      if (!activeWallet?.address) return;

      dispatch(setGetOngoingSessionsLoading(true));
      const response = await playerApi.getOngoingSessions(activeWallet.address);
      dispatch(setOngoingSessions(response.ongoingSessions));
      callbacks?.onSuccess?.(response);
      return response;
    } catch (err) {
      const error = err as Error;
      callbacks?.onError?.(error);
      throw error;
    } finally {
      dispatch(setGetOngoingSessionsLoading(false));
    }
  };

  // Rewards and points actions
  const getPlayerRewards = async (callbacks?: CallbackProps) => {
    try {
      if (!activeWallet?.address) return;

      dispatch(setGetPlayerRewardsLoading(true));
      const rewards = await playerApi.getPlayerRewards(activeWallet.address);
      dispatch(setPlayerRewards(rewards));
      callbacks?.onSuccess?.(rewards);
      return rewards;
    } catch (err) {
      callbacks?.onError?.(err);
    } finally {
      dispatch(setGetPlayerRewardsLoading(false));
    }
  };

  const getPlayerPoints = async (callbacks?: CallbackProps) => {
    try {
      if (!activeWallet?.address) return;

      dispatch(setGetPlayerPointsLoading(true));
      const points = await playerApi.getPlayerPoints(activeWallet.address);
      dispatch(setPlayerPoints(points));
      callbacks?.onSuccess?.(points);
      return points;
    } catch (err) {
      callbacks?.onError?.(err);
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
      callbacks?.onError?.(err);
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
      callbacks?.onError?.(err);
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
      callbacks?.onError?.(err);
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
      callbacks?.onError?.(err);
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
