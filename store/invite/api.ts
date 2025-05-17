import { axiosInstance } from "@/utils/axios";

type InviteAPI = {
  createInvite: (body: InviteCreationBody) => Promise<InviteCreationResponse>;
  acceptInvite: (
    body: InviteAcceptanceBody
  ) => Promise<InviteAcceptanceResponse>;

  createBettingInvite: (
    body: BettingCreationBody
  ) => Promise<BettingCreationResponse>;
  acceptBettingInvite: (
    body: InviteAcceptanceBody
  ) => Promise<BettingAcceptanceResponse>;
};

const inviteAPI: InviteAPI = {
  createInvite: async (body: InviteCreationBody) => {
    const response = await axiosInstance.post(`invites/create`, body);

    return response?.data;
  },

  acceptInvite: async (body: InviteAcceptanceBody) => {
    const response = await axiosInstance.post(`invites/accept`, body);

    return response?.data;
  },

  createBettingInvite: async (body: BettingCreationBody) => {
    const response = await axiosInstance.post(`invites/create-betting`, body);

    return response?.data;
  },

  acceptBettingInvite: async (body: InviteAcceptanceBody) => {
    const response = await axiosInstance.post(`invites/accept-betting`, body);

    return response?.data;
  },
};

export default inviteAPI;
