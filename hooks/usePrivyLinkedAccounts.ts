import {
  LinkedAccountWithMetadata,
  usePrivy,
  WalletWithMetadata,
} from "@privy-io/react-auth";
import useConnectToFarcaster from "./useConnectToFarcaster";

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

const isWalletWithAddress = (
  account: LinkedAccountWithMetadata | undefined
): account is LinkedAccountWithMetadata & { address: string } => {
  return (
    account?.type === "wallet" &&
    !account?.delegated &&
    account?.connectorType !== "embedded" &&
    account?.walletClientType !== "privy" &&
    "address" in (account || {})
  );
};

const usePrivyLinkedAccounts = () => {
  const { user } = usePrivy();
  const { isFrameLoaded } = useConnectToFarcaster();

  const embeddedEvmWallet = user?.linkedAccounts.find((account) =>
    isPrivyWallet(account, "ethereum")
  );

  const embeddedSolanaWallet = user?.linkedAccounts.find((account) =>
    isPrivyWallet(account, "solana")
  );

  const smartWallet = user?.linkedAccounts.find(
    (account) => account.type === "smart_wallet"
  );

  const farcasterWallet = user?.linkedAccounts.find(isWalletWithAddress);

  const activeWallet = isFrameLoaded
    ? farcasterWallet
    : smartWallet || embeddedEvmWallet;

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
