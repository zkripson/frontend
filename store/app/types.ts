interface AppState {
  isInGame: boolean;
  appIsReady: boolean;
  farcasterContext: FarcasterContext | undefined;
  toast: ToastState;
  balances: Balance[];
  loadingBalance: boolean;
}

type FarcasterContext = {
  displayName?: string;
  fid: number;
  location?: {
    description: string;
    placeId: string;
  };
  pfpUrl?: string;
  username?: string;
};

type Toast = "success" | "error" | "info" | "warning";

type ToastState = {
  message: string;
  type: Toast;
  show: boolean;
};

type Balance = {
  balance: string;
  symbol: string;
  decimals: number;
  address: `0x${string}`;
};
