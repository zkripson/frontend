interface IKPProgressClaimButton {
  percentage: number;
  status: "locked" | "claimable" | "claimed";
  onClaim?: () => void;
  className?: string;
}
