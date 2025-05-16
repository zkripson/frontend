import {
  LinkedAccountWithMetadata,
  usePrivy,
  WalletWithMetadata,
} from "@privy-io/react-auth";

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

  const embeddedEvmWallet = user?.linkedAccounts.find((account) =>
    isPrivyWallet(account, "ethereum")
  );

  const embeddedSolanaWallet = user?.linkedAccounts.find((account) =>
    isPrivyWallet(account, "solana")
  );

  const evmWallet = user?.linkedAccounts.find(
    (account) => account.type === "smart_wallet"
  );

  const linkedTwitter = user?.linkedAccounts?.find(
    (account) => account.type === "twitter_oauth"
  );

  const linkedFarcaster = user?.linkedAccounts?.find(
    (account) => account.type === "farcaster"
  );

  return {
    evmWallet,
    embeddedEvmWallet,
    linkedTwitter,
    linkedFarcaster,
    embeddedSolanaWallet,
  };
};

export default usePrivyLinkedAccounts;
