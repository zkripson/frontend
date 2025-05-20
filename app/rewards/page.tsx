"use client";
import { KPDialougue } from "@/components";
import { KPProgressClaimButton } from "@/components";
import useSystemFunctions from "@/hooks/useSystemFunctions";
import classNames from "classnames";
import Image from "next/image";

// Function to calculate time remaining from a date string in format "YYYY-MM-DD"
const calculateTimeRemaining = (dateString?: string) => {
  if (!dateString) return { days: 0, hours: 0, minutes: 0 };

  const targetDate = new Date(dateString);
  const now = new Date();

  // Calculate the difference in milliseconds
  const diffMs = targetDate.getTime() - now.getTime();

  // Convert to days, hours, minutes
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  return {
    days: days < 0 ? 0 : days,
    hours: hours < 0 ? 0 : hours,
    minutes: minutes < 0 ? 0 : minutes,
  };
};

const calculatePercentageTimeLeft = (nextClaimDate?: string) => {
  if (!nextClaimDate) return 50;

  const targetDate = new Date(nextClaimDate);
  const now = new Date();

  // Total time remaining in milliseconds
  const timeRemainingMs = targetDate.getTime() - now.getTime();

  // Assuming a 7-day period between distribution windows
  const totalDistributionPeriodMs = 7 * 24 * 60 * 60 * 1000;

  // Calculate percentage of time remaining (0-100)
  // 0% means no time left (claim ready)
  // 100% means full time remaining
  let percentage = Math.floor(
    (timeRemainingMs / totalDistributionPeriodMs) * 100
  );

  // Clamp between 0-100
  percentage = Math.max(0, Math.min(100, percentage));

  return percentage;
};

const RewardsScreen = () => {
  const {
    navigate,
    playerState: { playerRewards: data },
  } = useSystemFunctions();

  // Get time remaining from next claim date
  const nextClaimDate = data?.claimStatus?.nextClaimDate;
  const timeRemaining = calculateTimeRemaining(nextClaimDate);
  const claimablePoints = Number(data?.claimablePoints || 0).toLocaleString();
  const status = data?.claimStatus?.canClaim;
  const percentageTimeLeftToClaim = calculatePercentageTimeLeft(nextClaimDate);

  const contents = [
    {
      title: data?.streak?.currentDays?.toLocaleString() || "0",
      description: "Daily Streak",
      isStreak: true,
    },
    {
      title: "Current Level",
      description: "LEVEL 2",
    },
    {
      title: "Total Weekly Points",
      description: Number(data?.weeklyPoints || 0)?.toLocaleString() || "0",
    },
    {
      title: "Next Distribution",
      description: !nextClaimDate ? (
        "-"
      ) : (
        <p className="text-lg md:text-3xl text-nowrap">
          {String(timeRemaining.days).padStart(2, "0")}
          <span className="text-[10px] md:text-base">DAYS</span>{" "}
          {String(timeRemaining.hours).padStart(2, "0")}
          <span className="text-[10px] md:text-base">HRS</span>{" "}
          {String(timeRemaining.minutes).padStart(2, "0")}
          <span className="text-[10px] md:text-base">MINS</span>
        </p>
      ),
    },
    {
      title: "Referral Ribbons",
      description:
        Number(data?.referralPoints?.earned || 0)?.toLocaleString() || "0",
    },
    {
      title: "Total Referrals",
      description: "6",
    },
  ];

  console.log(percentageTimeLeftToClaim);

  return (
    <KPDialougue
      title="REWARDS"
      showBackButton
      onBack={() => navigate.back()}
      className="pt-[88px]"
    >
      <div className="grid grid-cols-2 max-sm:gap-4 gap-8 w-full pt-5 lg:pt-10">
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

      <div className="max-sm:mt-0 mt-5 lg:mt-10 w-full border border-dashed rounded-xl border-primary-50 px-3 pt-2 pb-1 lg:px-5 lg:pt-4 lg:pb-3 flex justify-between items-center text-primary-50">
        <div className="flex flex-col items-start lg:gap-1">
          <p className="text-xs md:text-base">Claimable Tokens</p>
          <p className="text-lg md:text-3xl text-nowrap font-MachineStd">
            {claimablePoints}
            <span className="text-[10px] md:text-base"> $SHIP</span>
          </p>
        </div>

        <KPProgressClaimButton
          percentage={percentageTimeLeftToClaim}
          status={status ? "claimable" : "locked"}
          onClaim={() => {}}
        />
      </div>
    </KPDialougue>
  );
};

export default RewardsScreen;
