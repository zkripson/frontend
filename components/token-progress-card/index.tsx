import Image from "next/image";

import { ArrowRightAltIcon, StarIcon } from "@/public/icons";

const KPTokenProgressCard = ({
  earned,
  goal,
  nextLevel,
  onClick,
}: IKPTokenProgressCard) => {
  const size = 62;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(earned / goal, 1);
  const offset = circumference * (1 - progress);

  return (
    <div
      onClick={onClick}
      className="bg-primary-50 rounded-2xl p-4 flex items-center justify-between cursor-pointer"
    >
      {/* Progress Circle with Icon */}
      <div className="relative w-16 h-16">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background Circle */}
          <circle
            className="stroke-[#F7C785]"
            strokeWidth={strokeWidth}
            fill="none"
            cx={size / 2}
            cy={size / 2}
            r={radius}
          />
          {/* Progress Circle */}
          <circle
            className="stroke-primary-200"
            strokeWidth={strokeWidth}
            fill="none"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="square"
          />
        </svg>
        {/* Center Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="hidden lg:flex bg-iconButton bg-contain bg-no-repeat size-8 md:size-[39px] items-center justify-center">
            <StarIcon />
          </div>

          <div className="flex lg:hidden bg-iconButton bg-contain bg-no-repeat size-9 items-center justify-center">
            <StarIcon width={16} height={16} />
          </div>
        </div>
      </div>

      {/* Text Content */}
      <div className="flex-grow sm:px-4 text-primary-300">
        <h3 className="text-sm font-medium">Tokens Earned</h3>
        <div className="mt-1 text-[clamp(14px,5vw,18px)] font-bold">
          ${earned}{" "}
          <span className="font-normal text-[clamp(10px,5vw,12px)]">
            / ${goal}
          </span>
        </div>
        <p className="mt-1 text-[clamp(10px,5vw,12px)] text-primary-300">
          Next: Level {nextLevel}
        </p>
      </div>

      {/* Chevron Icon */}
      <ArrowRightAltIcon />
    </div>
  );
};

export default KPTokenProgressCard;
