import usePrivyLinkedAccounts from "@/hooks/usePrivyLinkedAccounts";
import useConnectToFarcaster from "@/hooks/useConnectToFarcaster";
import useSystemFunctions from "@/hooks/useSystemFunctions";
import { matchmakingApi } from "./api";
import { setMatchMaking, setMatchMakingLoading } from "./index";
import { CallbackProps } from "..";
import useAppActions from "../app/actions";

export const useMatchMakingActions = () => {
  const { dispatch } = useSystemFunctions();
  const { activeWallet } = usePrivyLinkedAccounts();
  const { isFrameLoaded } = useConnectToFarcaster();
  const { showToast } = useAppActions();

  const joinMatchPool = async (
    stakeLevel: StakeLevel,
    callbacks?: CallbackProps
  ) => {
    try {
      if (!activeWallet) return;

      dispatch(setMatchMakingLoading(true));
      const channel = isFrameLoaded ? "farcaster" : "twitter";

      const data: JoinMatchPool = {
        address: activeWallet,
        stakeLevel,
        channel,
      };

      const response = await matchmakingApi.joinMatchPool(data);
      dispatch(setMatchMaking(response));
      callbacks?.onSuccess?.(response);

      return response;
    } catch (err: any) {
      console.error("joinMatchPool error:", err);
      // show error toast
      showToast(err?.message || "Failed to join matchmaking pool", "error");
      callbacks?.onError?.(err);
    } finally {
      dispatch(setMatchMakingLoading(false));
    }
  };

  const leaveMatchPool = async (callbacks?: CallbackProps) => {
    try {
      if (!activeWallet) return;

      dispatch(setMatchMakingLoading(true));

      const data: LeaveMatchPool = {
        address: activeWallet,
      };

      const response = await matchmakingApi.leaveMatchPool(data);
      callbacks?.onSuccess?.(response);

      return response;
    } catch (err) {
      console.log(err);
      callbacks?.onError?.(err);
    } finally {
      dispatch(setMatchMakingLoading(false));
    }
  };

  return {
    joinMatchPool,
    leaveMatchPool,
  };
};
