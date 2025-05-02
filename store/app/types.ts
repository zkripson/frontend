interface AppState {
  isInGame: boolean;
  appIsReady: boolean;
  farcasterContext: FarcasterContext | undefined;
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
