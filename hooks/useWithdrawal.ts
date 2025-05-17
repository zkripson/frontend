import { SendTransactionModalUIOptions } from "@privy-io/react-auth";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { parseUnits, encodeFunctionData, type Address, erc20Abi } from "viem";

import useAppActions from "@/store/app/actions";
import TOKEN_ADDRESSES from "@/constants/tokenAddresses";
import useSystemFunctions from "./useSystemFunctions";
import { setLoadingBalance } from "@/store/app";
import useBalance from "./useBalance";
import { defaultChain } from "@/providers/PrivyProvider";

type TokenType = keyof typeof TOKEN_ADDRESSES;

const useWithdrawal = () => {
  const { showToast } = useAppActions();
  const { dispatch } = useSystemFunctions();
  const { checkTokenBalance } = useBalance();
  const { getClientForChain } = useSmartWallets();

  const transferToken = async (
    toAddress: Address,
    amount: number,
    tokenType: TokenType = "USDC"
  ) => {
    try {
      const client = await getClientForChain({
        id: defaultChain.id,
      });
      if (!client) {
        return showToast("Something went wrong!", "error");
      }

      const uiOptions: SendTransactionModalUIOptions = {
        description: `Withdraw Funds`,
        buttonText: `Withdraw ${tokenType}`,
      };

      // Get token address
      const tokenAddress = TOKEN_ADDRESSES[tokenType] as Address;

      // Convert amount to proper decimals (USDC uses 6 decimals)
      const decimals = tokenType === "USDC" ? 6 : 18;
      const tokenAmount = parseUnits(amount.toString(), decimals);

      // Encode the ERC20 transfer function call
      const data = encodeFunctionData({
        abi: erc20Abi,
        functionName: "transfer",
        args: [toAddress, tokenAmount],
      });

      const hash = await client.sendTransaction(
        {
          to: tokenAddress,
          data,
          // Important: Do NOT include 'value' for ERC20 transfers
          // Only include 'data' for the contract call
          // Gas estimation will be handled by Privy
        },
        { uiOptions }
      );

      showToast("Successfully withdrew to your wallet!", "success");
      dispatch(setLoadingBalance(true));
      setTimeout(() => {
        checkTokenBalance(TOKEN_ADDRESSES.USDC);
      }, 1500);

      return hash;
    } catch (error) {
      console.error("Token transfer error:", error);
      throw error;
    }
  };

  return {
    transferToken,
  };
};

export default useWithdrawal;
