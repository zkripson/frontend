interface IKPTokenProgressCard {
  earned: number;
  goal: number;
  nextLevel: number;
  status: "win" | "draw" | "loss";
  payout?: string;
}
