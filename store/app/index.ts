import TOKEN_ADDRESSES from "@/constants/tokenAddresses";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { UsdcIcon } from "@/public/icons";

const initialState: AppState = {
  isInGame: false,
  appIsReady: false,
  farcasterContext: undefined,
  toast: {
    message: "",
    type: "success",
    show: false,
  },
  balances: [
    {
      balance: "0",
      address: TOKEN_ADDRESSES.USDC,
      decimals: 6,
      symbol: "USDC",
    },
    {
      balance: "0",
      address: TOKEN_ADDRESSES.SHIP,
      decimals: 18,
      symbol: "$SHIP",
    },
  ],
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

    setToast: (state, action: PayloadAction<ToastState>) => {
      state.toast = action.payload;
    },

    setBalances: (state, action: PayloadAction<Balance>) => {
      const tokenIndex = state.balances.findIndex(
        (balance) => balance.address === action.payload.address
      );
      if (tokenIndex !== -1) {
        state.balances[tokenIndex].balance = action.payload.balance;
        state.balances[tokenIndex].decimals = action.payload.decimals;
      } else {
        state.balances.push(action.payload);
      }
    },
  },
});

export const {
  setIsInGame,
  setAppIsReady,
  setFarcasterContext,
  setToast,
  setBalances,
} = appReducer.actions;

export default appReducer.reducer;
