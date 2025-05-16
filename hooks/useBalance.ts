import { base } from "viem/chains";
import { createPublicClient, http, formatUnits, erc20Abi } from "viem";
import { useState, useCallback } from "react";
import usePrivyLinkedAccounts from "./usePrivyLinkedAccounts";
import useSystemFunctions from "./useSystemFunctions";
import { setBalances } from "@/store/app";

const useBalance = () => {
  const { dispatch } = useSystemFunctions();
  const { evmWallet } = usePrivyLinkedAccounts();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenBalances, setTokenBalances] = useState<Record<string, string>>(
    {}
  );

  const checkTokenBalance = useCallback(
    async (tokenAddress: `0x${string}`) => {
      if (!evmWallet?.address) {
        setError("No wallet connected");
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Create a public client for Base
        const client = createPublicClient({
          chain: base,
          transport: http(),
        });

        // Get token balance
        const balance = await client.readContract({
          address: tokenAddress,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [evmWallet.address as `0x${string}`],
        });

        // Get token decimals
        const decimals = await client.readContract({
          address: tokenAddress,
          abi: erc20Abi,
          functionName: "decimals",
        });

        // Get token symbol (optional)
        const symbol = await client.readContract({
          address: tokenAddress,
          abi: erc20Abi,
          functionName: "symbol",
        });

        // Format balance with correct decimals
        const formattedBalance = formatUnits(balance, decimals);

        // Store in tokenBalances map
        setTokenBalances((prev) => ({
          ...prev,
          [tokenAddress]: formattedBalance,
        }));

        dispatch(
          setBalances({
            balance: formattedBalance,
            decimals,
            symbol,
            address: tokenAddress,
          })
        );

        return {
          balance: formattedBalance,
          decimals,
          symbol,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch token balance";
        setError(errorMessage);
        console.error("Error fetching token balance:", err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [evmWallet?.address]
  );

  return {
    checkTokenBalance,
    tokenBalances,
    isLoading,
    error,
  };
};

export default useBalance;
