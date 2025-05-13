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
  setLoadingMakeShot,
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
    board: BoardCommitment,
    callback?: CallbackProps
  ) => {
    try {
      if (!user?.wallet || !gameSessionInfo) return;

      dispatch(setLoadingSubmitBoardCommitment(true));

      const sessionId = gameSessionInfo.sessionId;

      const response = await gameAPI.submitBoardCommitment(sessionId, board);

      callback?.onSuccess?.(response);
    } catch (error) {
      console.error(error);
      callback?.onError?.(error);
    } finally {
      dispatch(setLoadingSubmitBoardCommitment(false));
    }
  };

  const makeShot = async (shot: MakeShot, callback?: CallbackProps) => {
    try {
      if (!user?.wallet || !gameSessionInfo) return;

      dispatch(setLoadingMakeShot(true));

      const sessionId = gameSessionInfo.sessionId;

      const response = await gameAPI.makeShot(sessionId, shot);

      callback?.onSuccess?.(response);
    } catch (error) {
      console.error(error);
      callback?.onError?.(error);
    } finally {
      dispatch(setLoadingMakeShot(false));
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

  return {
    createGameSession,
    fetchGameSessionInformation,
    joinGameSession,
    submitBoardCommitment,
    forfeitGame,
    makeShot,
  };
};

export default useGameActions;
