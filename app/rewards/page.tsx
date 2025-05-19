"use client";
import { KPDialougue } from "@/components";
import useSystemFunctions from "@/hooks/useSystemFunctions";
import classNames from "classnames";
import Image from "next/image";

const RewardsScreen = () => {
  const { navigate } = useSystemFunctions();

  const contents = [
    {
      title: "5",
      description: "Daily Streak",
      isStreak: true,
    },
    {
      title: "Current Level",
      description: "LEVEL 2",
    },
    {
      title: "Total Weekly Points",
      description: "345,689",
    },
    {
      title: "Next Distribution",
      description: (
        <p className="text-lg md:text-3xl text-nowrap">
          02<span className="text-[10px] md:text-base">DAYS</span> 04
          <span className="text-[10px] md:text-base">HRS</span> 32
          <span className="text-[10px] md:text-base">MINS</span>
        </p>
      ),
    },
    {
      title: "Referral Points",
      description: "345,698",
    },
    {
      title: "Total Referrals",
      description: "6",
    },
  ];

  return (
    <KPDialougue
      title="REWARDS"
      showBackButton
      onBack={() => navigate.back()}
      className="pt-[88px]"
    >
      <div className="grid grid-cols-2 gap-8 w-full pt-5 lg:pt-10">
        {contents.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-1 lg:gap-2 text-primary-50"
          >
            {item.isStreak && (
              <Image
                alt="streak"
                src="/images/streak.png"
                width={31}
                height={45}
                className="w-[18px] h-6 lg:w-7 lg:h-9 lg:-ml-1"
              />
            )}

            <div className="flex flex-col gap-1 items-start">
              <p
                className={classNames("text-nowrap", {
                  "font-MachineStd text-xl md:text-3xl": item.isStreak,
                  "text-xs md:text-base": !item.isStreak,
                })}
              >
                {item.title}
              </p>

              <p
                className={classNames("text-nowrap", {
                  "text-xs md:text-base": item.isStreak,
                  "text-xl md:text-3xl font-MachineStd": !item.isStreak,
                })}
              >
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 lg:mt-10 w-full border border-dashed rounded-xl border-primary-50 px-3 pt-2 pb-1 lg:px-5 lg:pt-4 lg:pb-3 flex justify-between items-center text-primary-50">
        <div className="flex flex-col items-start lg:gap-1">
          <p className="text-xs md:text-base">Claimable Tokens</p>
          <p className="text-lg md:text-3xl text-nowrap font-MachineStd">
            3,203<span className="text-[10px] md:text-base"> $SHIP</span>
          </p>
        </div>
        <div></div>
      </div>
    </KPDialougue>
  );
};

export default RewardsScreen;
