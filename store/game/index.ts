import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface GameState {
  gameSession?: GameSession;
  gameSessionInfo?: GameSessionInformation;
  loadingCreateGameSession: boolean;
  loadingJoinGameSession: boolean;
  loadingSubmitBoardCommitment: boolean;
  loadingStartGame: boolean;
  loadingForfeitGame: boolean;
  loadingRegisterGameContract: boolean;
  loadingGameSessionInfo: boolean;
  loadingMakeShot: boolean;
}

const initialState: GameState = {
  gameSession: undefined,
  gameSessionInfo: undefined,
  loadingCreateGameSession: false,
  loadingJoinGameSession: false,
  loadingSubmitBoardCommitment: false,
  loadingStartGame: false,
  loadingForfeitGame: false,
  loadingRegisterGameContract: false,
  loadingGameSessionInfo: false,
  loadingMakeShot: false,
};

export const gameReducer = createSlice({
  name: "game",
  initialState,
  reducers: {
    setLoadingCreateGameSession(state, action: PayloadAction<boolean>) {
      state.loadingCreateGameSession = action.payload;
    },

    setLoadingJoinGameSession(state, action: PayloadAction<boolean>) {
      state.loadingJoinGameSession = action.payload;
    },

    setLoadingSubmitBoardCommitment(state, action: PayloadAction<boolean>) {
      state.loadingSubmitBoardCommitment = action.payload;
    },

    setLoadingMakeShot(state, action: PayloadAction<boolean>) {
      state.loadingMakeShot = action.payload;
    },

    setLoadingStartGame(state, action: PayloadAction<boolean>) {
      state.loadingStartGame = action.payload;
    },

    setLoadingForfeitGame(state, action: PayloadAction<boolean>) {
      state.loadingForfeitGame = action.payload;
    },

    setLoadingRegisterGameContract(state, action: PayloadAction<boolean>) {
      state.loadingRegisterGameContract = action.payload;
    },

    setLoadingGameSessionInfo(state, action: PayloadAction<boolean>) {
      state.loadingGameSessionInfo = action.payload;
    },

    setGameSession(state, action: PayloadAction<GameSession | undefined>) {
      if (action.payload) {
        state.gameSession = { ...action.payload };
      } else {
        state.gameSession = undefined;
      }
    },

    setGameSessionInfo(
      state,
      action: PayloadAction<GameSessionInformation | undefined>
    ) {
      if (action.payload) {
        state.gameSessionInfo = { ...action.payload };
      } else {
        state.gameSessionInfo = undefined;
      }
    },
  },
});

export const {
  setGameSession,
  setGameSessionInfo,
  setLoadingCreateGameSession,
  setLoadingJoinGameSession,
  setLoadingSubmitBoardCommitment,
  setLoadingStartGame,
  setLoadingForfeitGame,
  setLoadingRegisterGameContract,
  setLoadingGameSessionInfo,
  setLoadingMakeShot,
} = gameReducer.actions;

export default gameReducer.reducer;
