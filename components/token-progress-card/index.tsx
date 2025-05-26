import Link from "next/link";

import { ArrowRightAltIcon, Meh, StarIcon } from "@/public/icons";

const KPTokenProgressCard = ({
  earned,
  goal,
  nextLevel,
}: IKPTokenProgressCard) => {
  const size = 62;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = 99;
  const offset = circumference * (1 - progress);

  // Determine which view to render based on earned tokens
  if (earned > 0) {
    return (
      <Link
        href="/rewards"
        replace
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
          <h3 className="text-sm font-medium">Ribbons Earned</h3>
          <span className="text-[clamp(24px,5vw,30px)] font-bold">
            {earned}
          </span>
          {/* <p className="mt-1 text-[clamp(10px,5vw,12px)] text-primary-300">
            Next: Level {nextLevel}
          </p> */}
        </div>

        {/* Chevron Icon */}
        <ArrowRightAltIcon />
      </Link>
    );
  }

  // Fallback view when no tokens earned
  return (
    <div className="bg-primary-50 rounded-2xl p-2 w-full flex flex-col items-center justify-center gap-3">
      <Meh />
      <p className="text-[clamp(10px,2.5vw,12px)] text-primary-300 text-center">
        NO RIBBONS EARNED IN THIS BATTLE
      </p>
    </div>
  );
};

export default KPTokenProgressCard;
