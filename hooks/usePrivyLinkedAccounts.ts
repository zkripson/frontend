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

  const evmWallet = user?.linkedAccounts.find((account) =>
    isPrivyWallet(account, "ethereum")
  );

  const solanaWallet = user?.linkedAccounts.find((account) =>
    isPrivyWallet(account, "solana")
  );

  const linkedTwitter = user?.linkedAccounts?.find(
    (account) => account.type === "twitter_oauth"
  );

  const linkedFarcaster = user?.linkedAccounts?.find(
    (account) => account.type === "farcaster"
  );

  return {
    evmWallet,
    solanaWallet,
    linkedTwitter,
    linkedFarcaster,
  };
};

export default usePrivyLinkedAccounts;
