import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface MatchmakingState {
  matchmaking: JoinMatchPoolResponse | null;

  // Loading state flags
  loading: {
    matchmaking: boolean;
  };
}

const initialState: MatchmakingState = {
  // matchmaking data
  matchmaking: null,

  // Loading state flags
  loading: {
    matchmaking: false,
  },
};

const matchmakingReducer = createSlice({
  name: "matchmaking",
  initialState,
  reducers: {
    // Loading state actions
    setMatchMakingLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.matchmaking = action.payload;
    },

    // Data update actions
    setMatchMaking: (state, action: PayloadAction<JoinMatchPoolResponse>) => {
      state.matchmaking = { ...action.payload };
    },

    // Reset actions
    resetMatchmakingState: (state) => {
      return initialState;
    },
  },
});

export const {
  // Loading state actions
  setMatchMakingLoading,

  // Data update actions
  setMatchMaking,

  // Reset actions
  resetMatchmakingState,
} = matchmakingReducer.actions;

export default matchmakingReducer.reducer;
