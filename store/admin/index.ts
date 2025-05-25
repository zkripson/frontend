import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { AdminState, initialAdminState, HealthStatus, MetricsData } from "./types";

export const adminReducer = createSlice({
  name: "admin",
  initialState: initialAdminState,
  reducers: {
    setLoadingHealth(state, action: PayloadAction<boolean>) {
      state.loading.health = action.payload;
    },

    setLoadingMetrics(state, action: PayloadAction<boolean>) {
      state.loading.metrics = action.payload;
    },

    setErrorHealth(state, action: PayloadAction<string | null>) {
      state.error.health = action.payload;
    },

    setErrorMetrics(state, action: PayloadAction<string | null>) {
      state.error.metrics = action.payload;
    },

    setHealth(state, action: PayloadAction<HealthStatus | null>) {
      state.health = action.payload;
    },

    setMetrics(state, action: PayloadAction<MetricsData | null>) {
      state.metrics = action.payload;
    },

    setLastUpdatedHealth(state, action: PayloadAction<number | null>) {
      state.lastUpdated.health = action.payload;
    },

    setLastUpdatedMetrics(state, action: PayloadAction<number | null>) {
      state.lastUpdated.metrics = action.payload;
    },

    resetAdminState(state) {
      return initialAdminState;
    },
  },
});

export const {
  setLoadingHealth,
  setLoadingMetrics,
  setErrorHealth,
  setErrorMetrics,
  setHealth,
  setMetrics,
  setLastUpdatedHealth,
  setLastUpdatedMetrics,
  resetAdminState,
} = adminReducer.actions;

export default adminReducer.reducer;