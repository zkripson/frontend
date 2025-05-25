import { adminApi } from "./api";
import {
  setHealth,
  setMetrics,
  setLoadingHealth,
  setLoadingMetrics,
  setErrorHealth,
  setErrorMetrics,
  setLastUpdatedHealth,
  setLastUpdatedMetrics,
} from ".";
import useSystemFunctions from "@/hooks/useSystemFunctions";
import { CallbackProps } from "..";

const useAdminActions = () => {
  const { dispatch } = useSystemFunctions();

  const fetchHealth = async (callback?: CallbackProps) => {
    try {
      dispatch(setLoadingHealth(true));
      dispatch(setErrorHealth(null));

      const response = await adminApi.getHealth();

      dispatch(setHealth(response));
      dispatch(setLastUpdatedHealth(Date.now()));

      callback?.onSuccess?.(response);
    } catch (error) {
      console.error("Error fetching health status:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch health status";
      dispatch(setErrorHealth(errorMessage));
      callback?.onError?.(error);
    } finally {
      dispatch(setLoadingHealth(false));
    }
  };

  const fetchMetrics = async (callback?: CallbackProps) => {
    try {
      dispatch(setLoadingMetrics(true));
      dispatch(setErrorMetrics(null));

      const response = await adminApi.getMetrics();

      dispatch(setMetrics(response));
      dispatch(setLastUpdatedMetrics(Date.now()));

      callback?.onSuccess?.(response);
    } catch (error) {
      console.error("Error fetching metrics:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch metrics";
      dispatch(setErrorMetrics(errorMessage));
      callback?.onError?.(error);
    } finally {
      dispatch(setLoadingMetrics(false));
    }
  };

  const refreshAll = async (callback?: CallbackProps) => {
    try {
      await Promise.all([
        fetchHealth(),
        fetchMetrics(),
      ]);

      callback?.onSuccess?.();
    } catch (error) {
      console.error("Error refreshing admin data:", error);
      callback?.onError?.(error);
    }
  };

  return {
    fetchHealth,
    fetchMetrics,
    refreshAll,
  };
};

export default useAdminActions;