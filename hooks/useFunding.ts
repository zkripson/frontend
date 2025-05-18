import { useFundWallet } from "@privy-io/react-auth";
import useAppActions from "@/store/app/actions";
import TOKEN_ADDRESSES from "@/constants/tokenAddresses";
import { setLoadingBalance } from "@/store/app";
import { defaultChain } from "@/providers/PrivyProvider";
import usePrivyLinkedAccounts from "./usePrivyLinkedAccounts";
import useBalance from "./useBalance";
import useSystemFunctions from "./useSystemFunctions";

const useFunding = () => {
  const { checkTokenBalance } = useBalance();
  const { showToast } = useAppActions();
  const { activeWallet } = usePrivyLinkedAccounts();
  const { dispatch } = useSystemFunctions();

  const { fundWallet: fundEVMWallet } = useFundWallet({
    onUserExited({}) {
      dispatch(setLoadingBalance(true));
      setTimeout(() => {
        checkTokenBalance(TOKEN_ADDRESSES.USDC);
      }, 2000);
    },
  });

  const fundWallet = (amount?: string) => {
    if (!activeWallet?.address)
      return showToast("Something went wrong!", "error");

    return fundEVMWallet(activeWallet?.address, {
      chain: defaultChain,
      amount,
      asset: {
        erc20: TOKEN_ADDRESSES.USDC,
      },
    });
  };

  return {
    fundWallet,
  };
};

export default useFunding;
