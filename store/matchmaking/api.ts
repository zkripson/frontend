import { axiosInstance } from "../../utils/axios";

export interface MatchmakingAPI {
  joinMatchPool: (body: JoinMatchPool) => Promise<JoinMatchPoolResponse>;
  leaveMatchPool: (body: LeaveMatchPool) => Promise<LeaveMatchPoolResponse>;
}

export const matchmakingApi: MatchmakingAPI = {
  joinMatchPool: async (body: JoinMatchPool) => {
    const response = await axiosInstance.post<JoinMatchPoolResponse>(
      "quickplay/join",
      body
    );
    return response.data;
  },

  leaveMatchPool: async (body: LeaveMatchPool) => {
    const response = await axiosInstance.post<LeaveMatchPoolResponse>(
      "quickplay/leave",
      body
    );
    return response.data;
  },
};
