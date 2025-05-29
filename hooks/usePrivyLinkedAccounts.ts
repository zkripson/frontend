import {
  LinkedAccountWithMetadata,
  usePrivy,
  WalletWithMetadata,
} from "@privy-io/react-auth";
import useConnectToFarcaster from "./useConnectToFarcaster";
import useWarpcastWallet from "./useWarpcastWallet";

function isPrivyWallet<T extends "ethereum" | "solana">(
  account: LinkedAccountWithMetadata,
  chainType: T
): account is WalletWithMetadata & { chainType: T; walletClientType: "privy" } {
  return (
    account.type === "wallet" &&
    account.chainType === chainType &&
    account.walletClientType === "privy"
  );
}

const usePrivyLinkedAccounts = () => {
  const { user } = usePrivy();
  const { isFrameLoaded } = useConnectToFarcaster();
  const { address: farcasterAddress } = useWarpcastWallet();

  const embeddedEvmWallet = user?.linkedAccounts.find((account) =>
    isPrivyWallet(account, "ethereum")
  );

  const embeddedSolanaWallet = user?.linkedAccounts.find((account) =>
    isPrivyWallet(account, "solana")
  );

  const smartWallet = user?.linkedAccounts.find(
    (account) => account.type === "smart_wallet"
  );

  const activeWallet = isFrameLoaded
    ? farcasterAddress
    : smartWallet?.address || embeddedEvmWallet?.address;

  const linkedTwitter = user?.linkedAccounts?.find(
    (account) => account.type === "twitter_oauth"
  );

  const linkedFarcaster = user?.linkedAccounts?.find(
    (account) => account.type === "farcaster"
  );

  return {
    activeWallet,
    embeddedEvmWallet,
    linkedTwitter,
    linkedFarcaster,
    embeddedSolanaWallet,
  };
};

export default usePrivyLinkedAccounts;
