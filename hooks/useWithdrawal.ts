import { SendTransactionModalUIOptions } from "@privy-io/react-auth";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import {
  parseUnits,
  encodeFunctionData,
  type Address,
  erc20Abi,
  createPublicClient,
  http,
} from "viem";

import useAppActions from "@/store/app/actions";
import TOKEN_ADDRESSES from "@/constants/tokenAddresses";
import useSystemFunctions from "./useSystemFunctions";
import { setLoadingBalance } from "@/store/app";
import useBalance from "./useBalance";
import { defaultChain } from "@/providers/PrivyProvider";
import useConnectToFarcaster from "./useConnectToFarcaster";
import useWarpcastWallet from "./useWarpcastWallet";
import usePrivyLinkedAccounts from "./usePrivyLinkedAccounts";

type TokenType = keyof typeof TOKEN_ADDRESSES;

const useWithdrawal = () => {
  const { showToast } = useAppActions();
  const { dispatch } = useSystemFunctions();
  const { checkTokenBalance } = useBalance();
  const { getClientForChain } = useSmartWallets();
  const { isFrameLoaded } = useConnectToFarcaster();
  const { provider: warpcastProvider, address: warpcastAddress } =
    useWarpcastWallet();
  const { activeWallet } = usePrivyLinkedAccounts();

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

  const checkAllowance = async (): Promise<boolean> => {
    try {
      const publicClient = createPublicClient({
        chain: defaultChain,
        transport: http(),
      });

      // Read the current allowance from the USDC contract
      const allowance = await publicClient.readContract({
        address: TOKEN_ADDRESSES.USDC as Address,
        abi: erc20Abi,
        functionName: "allowance",
        args: [
          activeWallet as `0x${string}`,
          TOKEN_ADDRESSES.BETTING as Address,
        ],
      });

      // Check if allowance is greater than 0 (already approved)
      return BigInt(allowance) > BigInt(0);
    } catch (error) {
      console.error("Error checking allowance:", error);
      // Default to false if check fails
      return false;
    }
  };

  const approveTransfer = async () => {
    try {
      // Get the current wallet address
      let walletAddress: Address;

      if (isFrameLoaded && warpcastAddress) {
        walletAddress = warpcastAddress;
      } else {
        walletAddress = activeWallet as `0x${string}`;
      }

      // Check if already approved using both methods
      const isApprovedOnChain = await checkAllowance();

      if (isApprovedOnChain) {
        return null;
      }

      // Use max uint256 value for unlimited approval
      const maxUint256 = BigInt(
        "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
      );

      let hash;

      if (isFrameLoaded && warpcastProvider && warpcastAddress) {
        const data = encodeFunctionData({
          abi: erc20Abi,
          functionName: "approve",
          args: [TOKEN_ADDRESSES.BETTING as Address, maxUint256],
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
          buttonText: `Approve`,
        };

        // Encode the ERC20 approve function call with unlimited amount
        const data = encodeFunctionData({
          abi: erc20Abi,
          functionName: "approve",
          args: [TOKEN_ADDRESSES.BETTING as Address, maxUint256],
        });

        hash = await client.sendTransaction(
          {
            to: TOKEN_ADDRESSES.USDC as Address,
            data,
          },
          { uiOptions }
        );
      }

      // Wait for transaction receipt
      if (hash) {
        const publicClient = createPublicClient({
          chain: defaultChain,
          transport: http(),
        });

        const receipt = await publicClient.waitForTransactionReceipt({
          hash: hash as `0x${string}`,
        });

        if (receipt.status === "success") {
          // Save approval to localStorage
          showToast("Approved!", "success");
        } else {
          showToast("Something went wrong. Try again!", "error");
          throw new Error("Approval failed");
        }

        return receipt;
      }

      return hash;
    } catch (error) {
      showToast("Failed to approve USDC", "error");
      throw error;
    }
  };

  return {
    transferToken,
    approveTransfer,
    checkAllowance,
  };
};

export default useWithdrawal;
