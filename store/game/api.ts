import { axiosInstance } from "@/utils/axios";

type GameAPI = {
  createGameSession: (creatorAddress: string) => Promise<GameSession>;
  getGameSessionInformation: (
    sessionId: string
  ) => Promise<GameSessionInformation>;
  joinGameSession: (
    sessionId: string,
    joinerAddress: string
  ) => Promise<JoinSession>;
  submitBoardCommitment: (
    sessionId: string,
    board: BoardCommitment
  ) => Promise<BoardCommitmentResponse>;
  forfeitGame: (
    sessionId: string,
    playerAddress: string,
    reason: ForfeitGameReason
  ) => Promise<ForfeitGame>;
  makeShot: (sessionId: string, shot: MakeShot) => Promise<MakeShotResponse>;
};

const gameAPI: GameAPI = {
  createGameSession: async (creatorAddress: string) => {
    const response = await axiosInstance.post(`sessions/create`, {
      creator: creatorAddress,
    });

    return response.data?.data;
  },

  getGameSessionInformation: async (sessionId: string) => {
    const response = await axiosInstance.get(`sessions/${sessionId}`);

    return response?.data;
  },

  joinGameSession: async (sessionId: string, joinerAddress: string) => {
    const response = await axiosInstance.post(`sessions/${sessionId}/join`, {
      address: joinerAddress,
    });

    return response.data?.data;
  },

  submitBoardCommitment: async (sessionId: string, board: BoardCommitment) => {
    const response = await axiosInstance.post(
      `sessions/${sessionId}/submit-board`,
      board
    );

    return response.data?.data;
  },

  forfeitGame: async (
    sessionId: string,
    playerAddress: string,
    reason: ForfeitGameReason
  ) => {
    const response = await axiosInstance.post(`sessions/${sessionId}/forfeit`, {
      address: playerAddress,
      reason,
    });

    return response.data?.data;
  },

  makeShot: async (sessionId: string, shot: MakeShot) => {
    const response = await axiosInstance.post(
      `sessions/${sessionId}/make-shot`,
      shot
    );

    return response.data?.data;
  },
};

export default gameAPI;
