type StakeValue = "free" | "2" | "5";

interface QuickGameFoundProps {
  countdown: number | null;
}

interface QuickGameSelectProps {
  stake: StakeValue;
  setStake: (stake: StakeValue) => void;
}

interface QuickGameSearchingProps {
  tip: string;
  tipIndex: number;
}
