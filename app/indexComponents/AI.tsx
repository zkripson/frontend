import { useState } from "react";
import { KPBotCard, KPDialougue } from "@/components";
import useSystemFunctions from "@/hooks/useSystemFunctions";

const bots = [
  {
    name: "Private Rusty",
    description:
      "Just out of bootcamp. Shoots randomly and forgets where you were last seen.",
    difficulty: "easy" as const,
  },
  {
    name: "Sergeant Steel",
    description:
      "Thinks before shooting. If he hits you once, expect follow-up fire.",
    difficulty: "medium" as const,
  },
  {
    name: "Commander Vex",
    description:
      "A ruthless tactician. Analyzes the board and exploits every pattern.",
    difficulty: "hard" as const,
  },
];

interface AIProps {
  onBack: () => void;
}

const AI: React.FC<AIProps> = ({ onBack }) => {
  const { navigate } = useSystemFunctions();
  const [selected, setSelected] = useState<Difficulty | null>(null);

  const handleStart = () => {
    if (!selected) return;
    navigate.push(`/ai/${selected}`);
  };

  return (
    <KPDialougue
      showBackButton
      onBack={onBack}
      className="pt-[88px]"
      primaryCta={{
        title: "Start Game",
        onClick: handleStart,
        icon: "arrow",
        iconPosition: "right",
        disabled: !selected,
        hide: !selected,
      }}
    >
      <h1 className="text-[26px] max-sm:text-[20px] leading-none text-primary-50 font-MachineStd mb-4 max-[390px]:mb-1 max-[450px]:mb-2">
        Choose Your Opponent
      </h1>

      <div className="space-y-4 max-[390px]:space-y-1 max-[450px]:space-y-2">
        {bots.map((bot) => (
          <KPBotCard
            key={bot.difficulty}
            name={bot.name}
            description={bot.description}
            difficulty={bot.difficulty}
            active={selected === bot.difficulty}
            action={() => setSelected(bot.difficulty)}
          />
        ))}
      </div>
    </KPDialougue>
  );
};

export default AI;
