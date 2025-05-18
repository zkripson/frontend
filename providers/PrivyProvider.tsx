"use client";

import { PropsWithChildren } from "react";
import { PrivyClientConfig, PrivyProvider } from "@privy-io/react-auth";
import { SmartWalletsProvider } from "@privy-io/react-auth/smart-wallets";
import { base, baseSepolia } from "viem/chains";
import { createConfig, WagmiProvider } from "@privy-io/wagmi";
import { farcasterFrame as miniAppConnector } from "@farcaster/frame-wagmi-connector";
import { http } from "viem";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const isDevEnv = process.env.NEXT_PUBLIC_ENVIRONMENT === "development";
export const defaultChain = isDevEnv ? baseSepolia : base;

const wagmiConfig = createConfig({
  chains: [defaultChain],
  transports: {
    [baseSepolia.id]: http(),
    [base.id]: http(),
  },
  connectors: [miniAppConnector()],
});

const queryClient = new QueryClient();

export const privyConfig: PrivyClientConfig = {
  defaultChain,
  loginMethods: ["farcaster", "twitter"],
  embeddedWallets: {
    ethereum: {
      createOnLogin: "all-users",
    },
  },
};

const PrivyWalletProvider = ({ children }: PropsWithChildren) => {
  if (!process.env.NEXT_PUBLIC_PRIVY_APP_ID) {
    throw new Error("NEXT_PUBLIC_PRIVY_APP_ID not found");
  }

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID}
      config={privyConfig}
    >
      <SmartWalletsProvider>
        <QueryClientProvider client={queryClient}>
          <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>
        </QueryClientProvider>
      </SmartWalletsProvider>
    </PrivyProvider>
  );
};

export default PrivyWalletProvider;
