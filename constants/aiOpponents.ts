export interface AIOpponent {
  name: string;
  avatarUrl: string;
  difficulty: string;
}

export const AI_OPPONENTS: Record<string, AIOpponent> = {
  easy: {
    name: "Private Rusty",
    avatarUrl: "/images/rusty.webp",
    difficulty: "easy",
  },
  medium: {
    name: "Sergeant Steel",
    avatarUrl: "/images/steel.webp",
    difficulty: "medium",
  },
  hard: {
    name: "Commander Vex",
    avatarUrl: "/images/vex.webp",
    difficulty: "hard",
  },
};
