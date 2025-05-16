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
