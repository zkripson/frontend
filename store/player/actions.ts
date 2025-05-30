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
  setOpponentProfile,
  setGetOpponentProfileLoading,
} from "./index";
import { CreateProfileRequest, UpdateProfileRequest } from "./types";
import { CallbackProps } from "..";
import usePrivyLinkedAccounts from "@/hooks/usePrivyLinkedAccounts";
import useConnectToFarcaster from "@/hooks/useConnectToFarcaster";
import useSystemFunctions from "@/hooks/useSystemFunctions";

export const usePlayerActions = () => {
  const dispatch = useDispatch();
  const { activeWallet, linkedTwitter } = usePrivyLinkedAccounts();
  const { isFrameLoaded } = useConnectToFarcaster();
  const { appState } = useSystemFunctions();

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
      if (!activeWallet) return;

      dispatch(setGetProfileLoading(true));
      const profile = await playerApi.getProfile(activeWallet);

      if (profile && profile.username && !profile.channel) {
        updateProfile({
          channel: isFrameLoaded ? "farcaster" : "twitter",
        });
      }
      dispatch(setPlayerProfile(profile));
      callbacks?.onSuccess?.(profile);
      return profile;
    } catch (err) {
      callbacks?.onError?.(err);

      const username =
        appState?.farcasterContext?.username || linkedTwitter?.username || "";
      const avatar =
        appState?.farcasterContext?.pfpUrl ||
        linkedTwitter?.profilePictureUrl ||
        "";

      createProfile({
        address: activeWallet!,
        avatar,
        username,
        preferences: {
          animationsEnabled: true,
          autoSubmitOnHit: true,
          notifications: true,
          soundEnabled: true,
          theme: "dark",
        },
        channel: isFrameLoaded ? "farcaster" : "twitter",
      });
    } finally {
      dispatch(setGetProfileLoading(false));
    }
  };

  const getOpponentProfile = async (
    address: string,
    callbacks?: CallbackProps
  ) => {
    try {
      if (!activeWallet || !address) return;
      if (address.toLowerCase() === activeWallet.toLowerCase()) return; // Prevent self as opponent

      dispatch(setGetOpponentProfileLoading(true));
      const profile = await playerApi.getProfile(address);
      dispatch(setOpponentProfile(profile));
      callbacks?.onSuccess?.(profile);
    } catch (err) {
      callbacks?.onError?.(err);
    } finally {
      dispatch(setGetOpponentProfileLoading(false));
    }
  };

  const updateProfile = async (
    data: UpdateProfileRequest,
    callbacks?: CallbackProps
  ) => {
    try {
      if (!activeWallet) return;

      dispatch(setUpdateProfileLoading(true));
      const response = await playerApi.updateProfile(activeWallet, data);
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
      if (!activeWallet) return;

      dispatch(setGetOngoingSessionsLoading(true));
      const response = await playerApi.getOngoingSessions(activeWallet);

      const validSessions = response.ongoingSessions.filter((session) => {
        const ageMs = Date.now() - session.createdAt;
        return ageMs <= 24 * 60 * 60 * 1000;
      });

      dispatch(setOngoingSessions(validSessions));
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
      if (!activeWallet) return;

      dispatch(setGetPlayerRewardsLoading(true));
      const rewards = await playerApi.getPlayerRewards(activeWallet);
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
      if (!activeWallet) return;

      dispatch(setGetPlayerPointsLoading(true));
      const points = await playerApi.getPlayerPoints(activeWallet);
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
    getOpponentProfile,
  };
};
