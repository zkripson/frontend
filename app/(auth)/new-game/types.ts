type NewGameStep = "chooseGame";

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
