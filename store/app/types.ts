interface AppState {
  isInGame: boolean;
  appIsReady: boolean;
  farcasterContext: FarcasterContext | undefined;
  toast: ToastState;
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
