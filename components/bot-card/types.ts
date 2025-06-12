type Difficulty = "easy" | "medium" | "hard";

interface KPBotCardProps {
  name: string;
  description: string;
  difficulty: Difficulty;
  action: () => void;
  active?: boolean;
  status?: "coming soon";
}
