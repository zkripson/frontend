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
  stakeAmount: string;
};

type BettingCreationResponse = {
  id: string;
  code: string;
  creator: string;
  stakeAmount: string;
  expiresAt: number;
  isBettingGame: boolean;
  onChainInviteId: number;
  transactionHash: string;
  inviteLink: string;
  sessionId: string;
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

type GetInvitationResponse = {
  id: string;
  creator: string;
  createdAt: number;
  expiresAt: number;
  sessionId: string;
  status: string;
  acceptedBy: null | string;
  acceptedAt: null | number;
  isBettingGame: boolean;
  isExpired: boolean;
  gameId?: null | string;
  stakeAmount?: string;
  onChainInviteId?: string;
};
