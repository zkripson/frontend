import useSystemFunctions from "@/hooks/useSystemFunctions";
import { usePrivy } from "@privy-io/react-auth";
import gameAPI from "./api";
import {
  setGameSession,
  setGameSessionInfo,
  setLoadingCreateGameSession,
  setLoadingForfeitGame,
  setLoadingGameSessionInfo,
  setLoadingJoinGameSession,
  setLoadingRegisterGameContract,
  setLoadingStartGame,
  setLoadingSubmitBoardCommitment,
} from ".";
import { CallbackProps } from "..";

const useGameActions = () => {
  const { dispatch, gameState } = useSystemFunctions();
  const { user } = usePrivy();
  const { gameSessionInfo } = gameState;

  const createGameSession = async (callback?: CallbackProps) => {
    try {
      if (!user?.wallet) return;

      dispatch(setLoadingCreateGameSession(true));

      const creatorAddress = user.wallet.address;
      const response = await gameAPI.createGameSession(creatorAddress);

      dispatch(setGameSession(response));

      fetchGameSessionInformation(response.sessionId);

      callback?.onSuccess?.(response);
    } catch (error) {
      console.error(error);
      callback?.onError?.(error);
    } finally {
      dispatch(setLoadingCreateGameSession(false));
    }
  };

  const fetchGameSessionInformation = async (sessionId: string) => {
    try {
      dispatch(setLoadingGameSessionInfo(true));

      const response = await gameAPI.getGameSessionInformation(sessionId);

      dispatch(setGameSessionInfo(response));
    } catch (error) {
      console.error(error);
    } finally {
      dispatch(setLoadingGameSessionInfo(false));
    }
  };

  const joinGameSession = async (callback?: CallbackProps) => {
    try {
      if (!user?.wallet || !gameSessionInfo) return;

      dispatch(setLoadingJoinGameSession(true));

      const joinerAddress = user.wallet.address;
      const sessionId = gameSessionInfo.sessionId;

      const response = await gameAPI.joinGameSession(sessionId, joinerAddress);

      callback?.onSuccess?.(response);
    } catch (error) {
      console.error(error);
      callback?.onError?.(error);
    } finally {
      dispatch(setLoadingJoinGameSession(false));
    }
  };

  const submitBoardCommitment = async (
    boardCommitment: string,
    callback?: CallbackProps
  ) => {
    try {
      if (!user?.wallet || !gameSessionInfo) return;

      dispatch(setLoadingSubmitBoardCommitment(true));

      const playerAddress = user.wallet.address;
      const sessionId = gameSessionInfo.sessionId;

      const response = await gameAPI.submitBoardCommitment(
        sessionId,
        playerAddress,
        boardCommitment
      );

      callback?.onSuccess?.(response);
    } catch (error) {
      console.error(error);
      callback?.onError?.(error);
    } finally {
      dispatch(setLoadingSubmitBoardCommitment(false));
    }
  };

  const startGame = async (callback?: CallbackProps) => {
    try {
      if (!user?.wallet || !gameSessionInfo) return;

      dispatch(setLoadingStartGame(true));

      const creatorAddress = user.wallet.address;
      const sessionId = gameSessionInfo.sessionId;

      const response = await gameAPI.startGame(sessionId, creatorAddress);

      callback?.onSuccess?.(response);
    } catch (error) {
      console.error(error);
      callback?.onError?.(error);
    } finally {
      dispatch(setLoadingStartGame(false));
    }
  };

  const forfeitGame = async (
    reason: ForfeitGameReason,
    callback?: CallbackProps
  ) => {
    try {
      if (!user?.wallet || !gameSessionInfo) return;

      dispatch(setLoadingForfeitGame(true));

      const playerAddress = user.wallet.address;
      const sessionId = gameSessionInfo.sessionId;

      const response = await gameAPI.forfeitGame(
        sessionId,
        playerAddress,
        reason
      );

      callback?.onSuccess?.(response);
    } catch (error) {
      console.error(error);
      callback?.onError?.(error);
    } finally {
      dispatch(setLoadingForfeitGame(false));
    }
  };

  const registerGameContract = async (
    gameContractAddress: string,
    gameId: string,
    callback?: CallbackProps
  ) => {
    try {
      if (!gameSessionInfo) return;

      dispatch(setLoadingRegisterGameContract(true));

      const sessionId = gameSessionInfo.sessionId;

      const response = await gameAPI.registerGameContract(
        sessionId,
        gameContractAddress,
        gameId
      );

      callback?.onSuccess?.(response);
    } catch (error) {
      console.error(error);
      callback?.onError?.(error);
    } finally {
      dispatch(setLoadingRegisterGameContract(false));
    }
  };

  return {
    createGameSession,
    fetchGameSessionInformation,
    joinGameSession,
    submitBoardCommitment,
    startGame,
    forfeitGame,
    registerGameContract,
  };
};

export default useGameActions;
