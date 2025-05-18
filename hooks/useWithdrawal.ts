import { SendTransactionModalUIOptions } from "@privy-io/react-auth";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { parseUnits, encodeFunctionData, type Address, erc20Abi } from "viem";

import useAppActions from "@/store/app/actions";
import TOKEN_ADDRESSES from "@/constants/tokenAddresses";
import useSystemFunctions from "./useSystemFunctions";
import { setLoadingBalance } from "@/store/app";
import useBalance from "./useBalance";
import { defaultChain } from "@/providers/PrivyProvider";
import useConnectToFarcaster from "./useConnectToFarcaster";
import useWarpcastWallet from "./useWarpcastWallet";

type TokenType = keyof typeof TOKEN_ADDRESSES;

const useWithdrawal = () => {
  const { showToast } = useAppActions();
  const { dispatch } = useSystemFunctions();
  const { checkTokenBalance } = useBalance();
  const { getClientForChain } = useSmartWallets();
  const { isFrameLoaded } = useConnectToFarcaster();
  const { provider: warpcastProvider, address: warpcastAddress } =
    useWarpcastWallet();

  const transferToken = async (
    toAddress: Address,
    amount: number,
    tokenType: TokenType = "USDC"
  ) => {
    try {
      // Get token address
      const tokenAddress = TOKEN_ADDRESSES[tokenType] as Address;

      // Convert amount to proper decimals (USDC uses 6 decimals)
      const decimals = tokenType === "USDC" ? 6 : 18;
      const tokenAmount = parseUnits(amount.toString(), decimals);

      let hash;

      if (isFrameLoaded && warpcastProvider && warpcastAddress) {
        const data = encodeFunctionData({
          abi: erc20Abi,
          functionName: "transfer",
          args: [toAddress, tokenAmount],
        });

        hash = await warpcastProvider.request({
          method: "eth_sendTransaction",
          params: [
            {
              from: warpcastAddress,
              to: tokenAddress,
              data,
              chainId: `0x${defaultChain.id.toString(16)}`,
            },
          ],
        });
      } else {
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

        // Encode the ERC20 transfer function call
        const data = encodeFunctionData({
          abi: erc20Abi,
          functionName: "transfer",
          args: [toAddress, tokenAmount],
        });

        hash = await client.sendTransaction(
          {
            to: tokenAddress,
            data,
            // Important: Do NOT include 'value' for ERC20 transfers
            // Only include 'data' for the contract call
            // Gas estimation will be handled by Privy
          },
          { uiOptions }
        );
      }

      showToast("Successfully withdrew to your wallet!", "success");
      dispatch(setLoadingBalance(true));
      setTimeout(() => {
        checkTokenBalance(TOKEN_ADDRESSES.USDC);
      }, 2500);

      return hash;
    } catch (error) {
      console.error("Token transfer error:", error);
      throw error;
    }
  };

  const approveTransfer = async (amount: number) => {
    try {
      // Convert amount to proper decimals (USDC uses 6 decimals)
      const tokenAmount = parseUnits(amount.toString(), 6);

      let hash;

      if (isFrameLoaded && warpcastProvider && warpcastAddress) {
        const data = encodeFunctionData({
          abi: erc20Abi,
          functionName: "approve",
          args: [TOKEN_ADDRESSES.BETTING as Address, tokenAmount],
        });

        hash = await warpcastProvider.request({
          method: "eth_sendTransaction",
          params: [
            {
              from: warpcastAddress,
              to: TOKEN_ADDRESSES.USDC as Address,
              data,
              chainId: `0x${defaultChain.id.toString(16)}`,
            },
          ],
        });
      } else {
        const client = await getClientForChain({
          id: defaultChain.id,
        });

        if (!client) {
          return showToast("Something went wrong!", "error");
        }

        const uiOptions: SendTransactionModalUIOptions = {
          description: `Approve USDC for betting`,
          buttonText: `Approve ${amount} USDC`,
        };

        // Encode the ERC20 approve function call
        const data = encodeFunctionData({
          abi: erc20Abi,
          functionName: "approve",
          args: [TOKEN_ADDRESSES.BETTING as Address, tokenAmount],
        });

        hash = await client.sendTransaction(
          {
            to: TOKEN_ADDRESSES.USDC as Address,
            data,
          },
          { uiOptions }
        );
      }

      return hash;
    } catch (error) {
      console.error("Approval error:", error);
      showToast("Failed to approve USDC", "error");
      throw error;
    }
  };

  return {
    transferToken,
    approveTransfer,
  };
};

export default useWithdrawal;
