import classNames from "classnames";

import { useAudio } from "@/providers/AudioProvider";

const difficultyStyles: Record<Difficulty, { text: string; bg: string }> = {
  easy: { text: "text-green-400", bg: "bg-green-500/10" },
  medium: { text: "text-yellow-400", bg: "bg-yellow-500/10" },
  hard: { text: "text-red-400", bg: "bg-red-500/10" },
};

const KPBotCard = ({
  name,
  description,
  difficulty,
  action,
  active = false,
  status,
}: KPBotCardProps) => {
  const { play } = useAudio();

  const diff = difficultyStyles[difficulty];

  const onClick = () => {
    play("place");
    action();
  };

  return (
    <div
      onClick={onClick}
      role="button"
      className={classNames(
        "relative w-full p-4 max-sm:p-2.5 flex flex-col gap-2 max-sm:gap-1 rounded-2xl hover:rounded-3xl border transition-all duration-500",
        "bg-primary-250 border-primary-350",
        {
          "shadow-[inset_0_4px_0_0_#5D656E]": !active,
          "shadow-[0_0_0_4px] border-primary-500": active,
          "opacity-50 pointer-events-none": status === "coming soon",
        }
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-MachineStd text-lg max-sm:text-base text-white">
          {name}
        </h3>
        <span
          className={classNames(
            "px-2 py-0.5 text-xs max-sm:text-[10px] max-sm:leading-[12px] font-semibold rounded-full",
            diff.text,
            diff.bg
          )}
        >
          {difficulty.toUpperCase()}
        </span>
      </div>

      <p className="text-sm max-sm:text-xs text-white/80">{description}</p>

      {status === "coming soon" && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-material px-3 py-1.5 border border-primary-600 rounded-full text-primary-600 text-[12px]">
            Coming Soon
          </div>
        </div>
      )}
    </div>
  );
};

export default KPBotCard;
