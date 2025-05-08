import useSystemFunctions from "@/hooks/useSystemFunctions";
import usePrivyLinkedAccounts from "@/hooks/usePrivyLinkedAccounts";
import inviteAPI from "./api";
import {
  setInviteAcceptance,
  setInviteCreation,
  setLoadingInviteAcceptance,
  setLoadingInviteCreation,
} from ".";
import { CallbackProps } from "..";
import useAppActions from "../app/actions";

const useInviteActions = () => {
  const { dispatch, navigate } = useSystemFunctions();
  const { evmWallet } = usePrivyLinkedAccounts();
  const { showToast } = useAppActions();

  const createInvite = async (callback?: CallbackProps) => {
    try {
      if (!evmWallet) return;

      dispatch(setLoadingInviteCreation(true));

      const creator = evmWallet.address;
      const sessionId = null;
      const body = { creator, sessionId };
      const response = await inviteAPI.createInvite(body);

      dispatch(setInviteCreation(response));

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
      if (!evmWallet) return;

      dispatch(setLoadingInviteAcceptance(true));

      const player = evmWallet.address;
      const body = { player, code };
      const response = await inviteAPI.acceptInvite(body);

      dispatch(setInviteAcceptance(response));

      showToast("Invite Accepted", "success");

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
