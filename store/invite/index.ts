import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface InviteState {
  loadingInviteCreation: boolean;
  loadingInviteAcceptance: boolean;

  inviteCreation?: InviteCreationResponse;
  inviteAcceptance?: InviteAcceptanceResponse;

  bettingCreation?: BettingCreationResponse;
  bettingAcceptance?: BettingAcceptanceResponse;
}

const initialState: InviteState = {
  loadingInviteCreation: false,
  loadingInviteAcceptance: false,

  inviteCreation: undefined,
  inviteAcceptance: undefined,

  bettingCreation: undefined,
  bettingAcceptance: undefined,
};

export const inviteReducer = createSlice({
  name: "invite",
  initialState,
  reducers: {
    setLoadingInviteCreation(state, action: PayloadAction<boolean>) {
      state.loadingInviteCreation = action.payload;
    },

    setLoadingInviteAcceptance(state, action: PayloadAction<boolean>) {
      state.loadingInviteAcceptance = action.payload;
    },

    setInviteCreation(state, action: PayloadAction<InviteCreationResponse>) {
      state.inviteCreation = { ...action.payload };
    },

    setInviteAcceptance(
      state,
      action: PayloadAction<InviteAcceptanceResponse>
    ) {
      state.inviteAcceptance = { ...action.payload };
    },

    setBettingCreation(state, action: PayloadAction<BettingCreationResponse>) {
      state.bettingCreation = { ...action.payload };
    },

    setBettingAcceptance(
      state,
      action: PayloadAction<BettingAcceptanceResponse>
    ) {
      state.bettingAcceptance = { ...action.payload };
    },
  },
});

export const {
  setLoadingInviteCreation,
  setLoadingInviteAcceptance,
  setInviteCreation,
  setInviteAcceptance,
  setBettingCreation,
  setBettingAcceptance,
} = inviteReducer.actions;

export default inviteReducer.reducer;
