"use client";
import { configureStore } from "@reduxjs/toolkit";
import appReducer from "./app";
import gameReducer from "./game";
import inviteReducer from "./invite";
import playerReducer from "./player";
import adminReducer from "./admin";

export interface CallbackProps {
  onSuccess?: Function;
  onError?: Function;
}

export const store = configureStore({
  reducer: {
    app: appReducer,
    game: gameReducer,
    invite: inviteReducer,
    player: playerReducer,
    admin: adminReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {user: UserState}
export type AppDispatch = typeof store.dispatch;
