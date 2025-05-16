import { useFundWallet as useEVMFundWallet } from "@privy-io/react-auth";
import { base } from "viem/chains";
import useAppActions from "@/store/app/actions";
import { formatEther } from "viem";
import usePrivyLinkedAccounts from "./usePrivyLinkedAccounts";

const useFunding = () => {
  const { showToast } = useAppActions();
  const { evmWallet } = usePrivyLinkedAccounts();
  const { fundWallet: fundEVMWallet } = useEVMFundWallet({
    onUserExited({ balance, address }) {
      const privyBalance = formatEther(balance!);
      const serverBalance = 1;

      if (serverBalance === undefined) return; // update user balance

      if (Number(privyBalance) > serverBalance) {
        showToast(
          "Deposit successful! It might take a few seconds to reflect on your balance.",
          "success"
        );
        // update user balance
      }
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
