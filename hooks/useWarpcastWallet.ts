import FrameSDK from "@farcaster/frame-sdk";
import { useState, useEffect } from "react";

// Define a generic EIP-1193 Ethereum Provider type
type EthereumRequest = {
  method: string;
  params?: unknown[] | object;
};

type EthereumProvider = {
  request: (args: EthereumRequest) => Promise<any>;
  on: (event: string, listener: (...args: any[]) => void) => void;
  removeListener?: (event: string, listener: (...args: any[]) => void) => void;
  isMetaMask?: boolean;
  isWarpcast?: boolean;
  [key: string]: any;
};

const useWarpcastWallet = () => {
  const [provider, setProvider] = useState<EthereumProvider | null>(null);
  const [address, setAddress] = useState<`0x${string}` | null>(null);

  useEffect(() => {
    const initWarpcastWallet = async () => {
      try {
        // Check if we're in a Frame and SDK is available
        if (FrameSDK.wallet && FrameSDK.wallet.ethProvider) {
          // Cast to our provider type
          const ethProvider = FrameSDK.wallet.ethProvider as EthereumProvider;
          setProvider(ethProvider);

          try {
            const accounts = await ethProvider.request({
              method: "eth_requestAccounts",
            });

            if (accounts && accounts.length > 0) {
              setAddress(accounts[0] as `0x${string}`);
            }
          } catch (accountError) {
            // Fall back to eth_accounts
            try {
              const accounts = await ethProvider.request({
                method: "eth_accounts",
              });

              if (accounts && accounts.length > 0) {
                setAddress(accounts[0] as `0x${string}`);
              }
            } catch (fallbackError) {
              console.error(
                "Fallback account retrieval failed:",
                fallbackError
              );
            }
          }
        } else {
          console.log("Warpcast ethProvider not available");
        }
      } catch (error) {
        console.error("Failed to connect to Warpcast wallet:", error);
      }
    };

    initWarpcastWallet();
  }, []);

  return { provider, address };
};

export default useWarpcastWallet;
