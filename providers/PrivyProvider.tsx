import { PropsWithChildren } from "react";
import { PrivyClientConfig, PrivyProvider } from "@privy-io/react-auth";
import { SmartWalletsProvider } from "@privy-io/react-auth/smart-wallets";
import { base } from "viem/chains";

export const privyConfig: PrivyClientConfig = {
  defaultChain: base,
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
      <SmartWalletsProvider>{children}</SmartWalletsProvider>
    </PrivyProvider>
  );
};

export default PrivyWalletProvider;
