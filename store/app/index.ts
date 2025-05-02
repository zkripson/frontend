import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

const initialState: AppState = {
  isInGame: false,
  appIsReady: false,
  farcasterContext: undefined,
};

export const appReducer = createSlice({
  name: "app",
  initialState,
  reducers: {
    setIsInGame(state, action: PayloadAction<boolean>) {
      state.isInGame = action.payload;
    },

    setAppIsReady(state, action: PayloadAction<boolean>) {
      state.appIsReady = action.payload;
    },

    setFarcasterContext(state, action: PayloadAction<FarcasterContext>) {
      state.farcasterContext = { ...action.payload };
    },
  },
});

export const { setIsInGame, setAppIsReady, setFarcasterContext } =
  appReducer.actions;

export default appReducer.reducer;
