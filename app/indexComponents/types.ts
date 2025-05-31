type NewGameStep = "select" | "create" | "stake" | "quick";

interface GameType {
  id: string;
  name: string;
  description: string;
  status?: "coming soon";
  action?: () => void;
}

interface SelectGridProps<T extends string | number> {
  title: string;
  options: T[];
  selected: T | null;
  onSelect: (value: T) => void;
  height: string;
}

interface SelectGameScreenProps {
  phase: NewGameStep;
  setPhase: (phase: NewGameStep) => void;
}

type QuickGamePhase = "select" | "searching" | "found";

interface QuickGameProps {
  setParentPhase: (phase: NewGameStep) => void;
}
