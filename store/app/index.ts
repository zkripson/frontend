import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

const initialState: AppState = {
  isInGame: false,
  appIsReady: false,
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
  },
});

export const { setIsInGame, setAppIsReady } = appReducer.actions;

export default appReducer.reducer;
