import { axiosInstance } from "@/utils/axios";

type InviteAPI = {
  createInvite: (body: InviteCreationBody) => Promise<InviteCreationResponse>;
  acceptInvite: (
    body: InviteAcceptanceBody
  ) => Promise<InviteAcceptanceResponse>;
};

const inviteAPI: InviteAPI = {
  createInvite: async (body: InviteCreationBody) => {
    const response = await axiosInstance.post(`invites/create`, body);

    return response.data?.data;
  },

  acceptInvite: async (body: InviteAcceptanceBody) => {
    const response = await axiosInstance.post(`invites/accept`, body);

    return response.data?.data;
  },
};

export default inviteAPI;
