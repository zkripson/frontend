import useSystemFunctions from "@/hooks/useSystemFunctions";
import { usePrivy } from "@privy-io/react-auth";
import inviteAPI from "./api";
import {
  setInviteAcceptance,
  setInviteCreation,
  setLoadingInviteAcceptance,
  setLoadingInviteCreation,
} from ".";
import { CallbackProps } from "..";

const useInviteActions = () => {
  const { dispatch, navigate } = useSystemFunctions();
  const { user } = usePrivy();

  const createInvite = async (callback?: CallbackProps) => {
    try {
      if (!user?.wallet) return;

      dispatch(setLoadingInviteCreation(true));

      const creator = user.wallet.address;
      const sessionId = null;
      const body = { creator, sessionId };
      const response = await inviteAPI.createInvite(body);

      dispatch(setInviteCreation(response));

      navigate.push(`/${response.sessionId}`);

      callback?.onSuccess?.(response);
    } catch (error) {
      console.error(error);
      callback?.onError?.(error);
    } finally {
      dispatch(setLoadingInviteCreation(false));
    }
  };

  const acceptInvite = async (code: string, callback?: CallbackProps) => {
    try {
      if (!user?.wallet) return;

      dispatch(setLoadingInviteAcceptance(true));

      const player = user.wallet.address;
      const body = { player, code };
      const response = await inviteAPI.acceptInvite(body);

      dispatch(setInviteAcceptance(response));

      navigate.push(`/${response.sessionId}`);

      callback?.onSuccess?.(response);
    } catch (error) {
      console.error(error);
      callback?.onError?.(error);
    } finally {
      dispatch(setLoadingInviteAcceptance(false));
    }
  };

  return {
    createInvite,
    acceptInvite,
  };
};

export default useInviteActions;
