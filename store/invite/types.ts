type InviteCreationBody = {
  creator: string;
};

type InviteCreationResponse = {
  id: string;
  code: string;
  creator: string;
  expiresAt: number;
  sessionId: string;
  inviteLink: string;
};

type InviteAcceptanceBody = {
  code: string;
  player: string;
};

type InviteAcceptanceResponse = {
  success: boolean;
  inviteId: string;
  sessionId: string;
  creator: string;
  acceptedBy: string;
  status: "WAITING" | "READY";
};

type BettingCreationBody = {
  creator: string;
  stakeAmountUSDC: string;
  expirationHours: number;
};

type BettingCreationResponse = {
  success: boolean;
  inviteId: string;
  onChainId: number;
  code: string;
  stakeAmountUSDC: string;
  totalPool: string;
  expiresAt: number;
};

type BettingAcceptanceResponse = {
  success: boolean;
  sessionId: string;
  gameId: number;
  gameContractAddress: string;
  totalPool: string;
  platformFee: string;
  winnerPayout: string;
};
