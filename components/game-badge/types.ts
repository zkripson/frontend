interface IKPGameBadge {
  status: "ready" | "joining..." | "setting up";
  username: string;
  avatarUrl?: string;
  isPlayer?: boolean;
}
