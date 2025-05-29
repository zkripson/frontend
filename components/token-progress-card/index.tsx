"use client";
import Link from "next/link";

import { useScreenDetect } from "@/hooks/useScreenDetect";

import { ArrowRightAltIcon, Meh, StarIcon } from "@/public/icons";

const KPTokenProgressCard = ({ earned }: IKPTokenProgressCard) => {
  const { isXSmall, isSmall } = useScreenDetect();
  const isCompact = isXSmall || isSmall;

  const size = isCompact ? 48 : 62;
  const strokeWidth = isCompact ? 6 : 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = 99; // or wire up real progress
  const offset = circumference * (1 - progress);
  const iconSize = isCompact ? 12 : 16;

  if (earned > 0) {
    return (
      <Link
        href="/rewards"
        replace
        className="bg-primary-50 rounded-2xl p-4 flex items-center justify-between cursor-pointer max-sm:p-2"
      >
        {/* Progress Circle */}
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="transform -rotate-90">
            {/* background */}
            <circle
              className="stroke-[#F7C785]"
              strokeWidth={strokeWidth}
              fill="none"
              cx={size / 2}
              cy={size / 2}
              r={radius}
            />
            {/* progress */}
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
          {/* Star center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="size-[65%] bg-iconButton bg-contain bg-no-repeat flex items-center justify-center mt-[1px] ml-[1px]">
              <StarIcon width={iconSize} height={iconSize} />
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="flex-grow sm:px-4 text-primary-300 flex flex-col gap-1">
          <h3 className="text-[min(5vw,14px)] font-medium">Ribbons Earned</h3>
          <span className="text-[min(5vw,30px)] font-bold">{earned}</span>
        </div>

        {/* Chevron */}
        <ArrowRightAltIcon />
      </Link>
    );
  }

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
