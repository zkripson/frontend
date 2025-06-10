type StakeLevel = "FREE" | "LOW" | "MEDIUM";

type JoinMatchPool = {
  address: string;
  stakeLevel: StakeLevel;
  channel?: "farcaster" | "twitter" | "discord"; // Optional
};

type JoinMatchPoolResponse = {
  status: "matched" | "waiting" | "pending_match";
  sessionId?: string;
  opponent?: string;
  isBettingGame?: boolean;
  joinedAt?: number;
  message?: string;
  queuePosition?: number;
};

type LeaveMatchPool = {
  address: string;
};

type LeaveMatchPoolResponse = {
  success: boolean;
  message?: string;
};
