import { AxiosError } from "axios";

import useSystemFunctions from "@/hooks/useSystemFunctions";
import usePrivyLinkedAccounts from "@/hooks/usePrivyLinkedAccounts";
import inviteAPI from "./api";
import {
  setBettingAcceptance,
  setBettingCreation,
  setInviteAcceptance,
  setInviteCreation,
  setLoadingInviteAcceptance,
  setLoadingInviteCreation,
  setInvitation,
  setInvitationLoading,
} from ".";
import { CallbackProps } from "..";
import useAppActions from "../app/actions";
import { usePlayerActions } from "../player/actions";

const useInviteActions = () => {
  const { dispatch, navigate } = useSystemFunctions();
  const { activeWallet } = usePrivyLinkedAccounts();
  const { showToast } = useAppActions();
  const { getOpponentProfile } = usePlayerActions();

  const createInvite = async (callback?: CallbackProps) => {
    try {
      if (!activeWallet) return;

      dispatch(setLoadingInviteCreation(true));

      const creator = activeWallet.address;
      const body = { creator };
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
      if (!activeWallet) return;

      dispatch(setLoadingInviteAcceptance(true));

      const player = activeWallet.address;
      const body = { player, code };
      const response = await inviteAPI.acceptInvite(body);

      dispatch(setInviteAcceptance(response));
      showToast("Invite Accepted", "success");
      navigate.push(`/${response.sessionId}`);
      callback?.onSuccess?.(response);
    } catch (err) {
      let message = "Error accepting invite";
      let isAlreadyAcceptedError = false;

      if ((err as AxiosError).isAxiosError) {
        const axiosErr = err as AxiosError<{ error?: string }>;
        const apiError = axiosErr.response?.data.error;

        if (apiError) {
          if (apiError.includes("status: accepted")) {
            message = "This invite has already been accepted";
            isAlreadyAcceptedError = true;
          } else {
            message = apiError;
          }
        }
      }

      showToast(message, "error");
      callback?.onError?.(err);
    } finally {
      dispatch(setLoadingInviteAcceptance(false));
    }
  };

  const createBettingInvite = async (
    stakeAmount: string,
    callback?: CallbackProps
  ) => {
    try {
      if (!activeWallet) return;

      dispatch(setLoadingInviteCreation(true));

      const creator = activeWallet.address;
      const body = { creator, stakeAmount };
      const response = await inviteAPI.createBettingInvite(body);

      dispatch(setBettingCreation(response));

      callback?.onSuccess?.(response);
    } catch (error) {
      console.error(error);
      callback?.onError?.(error);
    } finally {
      dispatch(setLoadingInviteCreation(false));
    }
  };

  const acceptBettingInvite = async (
    code: string,
    callback?: CallbackProps
  ) => {
    try {
      if (!activeWallet) return;

      dispatch(setLoadingInviteAcceptance(true));

      const player = activeWallet.address;
      const body = { player, code };
      const response = await inviteAPI.acceptBettingInvite(body);

      dispatch(setBettingAcceptance(response));
      showToast("Invite Accepted", "success");
      navigate.push(`/${response.sessionId}`);
      callback?.onSuccess?.(response);
    } catch (err) {
      let message = "Error accepting invite";
      let isAlreadyAcceptedError = false;

      if ((err as AxiosError).isAxiosError) {
        const axiosErr = err as AxiosError<{ error?: string }>;
        const apiError = axiosErr.response?.data.error;

        if (apiError) {
          if (apiError.includes("status: accepted")) {
            message = "This invite has already been accepted";
            isAlreadyAcceptedError = true;
          } else {
            message = apiError;
          }
        }
      }

      showToast(message, "error");
      callback?.onError?.(err);
    } finally {
      dispatch(setLoadingInviteAcceptance(false));
    }
  };

  const getInvitation = async (code: string, callback?: CallbackProps) => {
    try {
      if (!activeWallet) return;

      dispatch(setInvitationLoading(true));

      const response = await inviteAPI.getInvitation(code);

      dispatch(setInvitation(response));

      if (response.creator) {
        getOpponentProfile(response.creator);
      }

      callback?.onSuccess?.(response);
    } catch (err) {
      console.error(err);
      callback?.onError?.(err);
    } finally {
      dispatch(setInvitationLoading(false));
    }
  };

  return {
    createInvite,
    acceptInvite,
    createBettingInvite,
    acceptBettingInvite,
    getInvitation,
  };
};

export default useInviteActions;
