import FrameSDK from "@farcaster/frame-sdk";
import { useState, useEffect } from "react";
import type * as Provider from "ox/Provider";

const useWarpcastWallet = () => {
  const [provider, setProvider] = useState<Provider.Provider | null>(null);
  const [address, setAddress] = useState<`0x${string}` | null>(null);

  useEffect(() => {
    const initWarpcastWallet = async () => {
      try {
        // Check if we're in a Frame and SDK is available
        if (FrameSDK.wallet && FrameSDK.wallet.ethProvider) {
          // Cast to our provider type
          const ethProvider = await FrameSDK.wallet.getEthereumProvider();

          if (!ethProvider) return;

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
              const accounts = await ethProvider?.request({
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
