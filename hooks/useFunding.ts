import { useFundWallet } from "@privy-io/react-auth";
import { base } from "viem/chains";
import useAppActions from "@/store/app/actions";
import { formatEther } from "viem";
import usePrivyLinkedAccounts from "./usePrivyLinkedAccounts";
import useBalance from "./useBalance";
import TOKEN_ADDRESSES from "@/constants/tokenAddresses";
import useSystemFunctions from "./useSystemFunctions";
import { setLoadingBalance } from "@/store/app";

const useFunding = () => {
  const { checkTokenBalance } = useBalance();
  const { showToast } = useAppActions();
  const { evmWallet } = usePrivyLinkedAccounts();
  const { appState, dispatch } = useSystemFunctions();

  const { fundWallet: fundEVMWallet } = useFundWallet({
    onUserExited({}) {
      dispatch(setLoadingBalance(true));
      setTimeout(() => {
        checkTokenBalance(TOKEN_ADDRESSES.USDC);
      }, 1500);
    },
  });

  const fundWallet = (amount?: string) => {
    if (!evmWallet?.address) return showToast("Something went wrong!", "error");

    return fundEVMWallet(evmWallet?.address, {
      chain: base,
      amount,
    });
  };

  return {
    fundWallet,
  };
};

export default useFunding;
