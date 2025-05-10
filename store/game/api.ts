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
    playerAddress: string,
    boardCommitment: string
  ) => Promise<BoardCommitment>;
  startGame: (sessionId: string, creatorAddress: string) => Promise<StartGame>;
  forfeitGame: (
    sessionId: string,
    playerAddress: string,
    reason: ForfeitGameReason
  ) => Promise<ForfeitGame>;
  registerGameContract: (
    sessionId: string,
    gameContractAddress: string,
    gameId: string
  ) => Promise<RegisterGameContract>;
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

  submitBoardCommitment: async (
    sessionId: string,
    playerAddress: string,
    boardCommitment: string
  ) => {
    const response = await axiosInstance.post(
      `sessions/${sessionId}/submit-board`,
      {
        address: playerAddress,
        boardCommitment,
      }
    );

    return response.data?.data;
  },

  startGame: async (sessionId: string, creatorAddress: string) => {
    const response = await axiosInstance.post(`sessions/${sessionId}/start`, {
      address: creatorAddress,
    });

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

  registerGameContract: async (
    sessionId: string,
    gameContractAddress: string,
    gameId: string
  ) => {
    const response = await axiosInstance.post(`contracts/register-game`, {
      sessionId,
      gameContractAddress,
      gameId,
    });

    return response.data?.data;
  },
};

export default gameAPI;
