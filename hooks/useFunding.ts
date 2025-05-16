import { useFundWallet } from "@privy-io/react-auth";
import { base } from "viem/chains";
import useAppActions from "@/store/app/actions";
import usePrivyLinkedAccounts from "./usePrivyLinkedAccounts";
import useBalance from "./useBalance";
import TOKEN_ADDRESSES from "@/constants/tokenAddresses";
import useSystemFunctions from "./useSystemFunctions";
import { setLoadingBalance } from "@/store/app";

const useFunding = () => {
  const { checkTokenBalance } = useBalance();
  const { showToast } = useAppActions();
  const { evmWallet } = usePrivyLinkedAccounts();
  const { dispatch } = useSystemFunctions();

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
      asset: {
        erc20: TOKEN_ADDRESSES.USDC,
      },
    });
  };

  const fundWithEth = (amount?: string) => {
    if (!evmWallet?.address) return showToast("Something went wrong!", "error");

    return fundEVMWallet(evmWallet?.address, {
      chain: base,
      amount,
      // Funding with native ETH for gas fees
    });
  };

  return {
    fundWallet,
    fundWithEth,
  };
};

export default useFunding;
