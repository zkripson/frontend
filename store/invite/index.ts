import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface InviteState {
  loadingInviteCreation: boolean;
  inviteCreation?: InviteCreationResponse;
  loadingInviteAcceptance: boolean;
  inviteAcceptance?: InviteAcceptanceResponse;
}

const initialState: InviteState = {
  loadingInviteCreation: false,
  inviteCreation: undefined,
  loadingInviteAcceptance: false,
  inviteAcceptance: undefined,
};

export const inviteReducer = createSlice({
  name: "invite",
  initialState,
  reducers: {
    setLoadingInviteCreation(state, action: PayloadAction<boolean>) {
      state.loadingInviteCreation = action.payload;
    },

    setInviteCreation(state, action: PayloadAction<InviteCreationResponse>) {
      state.inviteCreation = action.payload;
    },

    setLoadingInviteAcceptance(state, action: PayloadAction<boolean>) {
      state.loadingInviteAcceptance = action.payload;
    },

    setInviteAcceptance(
      state,
      action: PayloadAction<InviteAcceptanceResponse>
    ) {
      state.inviteAcceptance = action.payload;
    },
  },
});

export const {
  setLoadingInviteCreation,
  setLoadingInviteAcceptance,
  setInviteCreation,
  setInviteAcceptance,
} = inviteReducer.actions;

export default inviteReducer.reducer;
