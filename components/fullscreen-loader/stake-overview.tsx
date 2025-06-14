import { Question } from "@/public/icons";
import Image from "next/image";

interface StakeOverviewProps {
  leftName: string;
  leftAvatarUrl: string;
  rightName?: string;
  rightAvatarUrl?: string;
  amount: number | string;
  className?: string;
  isComputerGame?: boolean;
}

const StakeOverview = ({
  leftName,
  leftAvatarUrl,
  amount,
  rightAvatarUrl,
  rightName,
  isComputerGame,
}: StakeOverviewProps) => (
  <div
    className={`flex flex-col md:flex-row items-center justify-center lg:gap-10 bg-transparent text-primary-50 p-5 gap-5`}
  >
    {leftName && leftAvatarUrl ? (
      <div className="flex flex-col items-center">
        <span className="mb-2 text-[clamp(10px,5vw,16px)] font-bold uppercase">
          {leftName}
        </span>
        <div className="relative w-20 h-20">
          <Image
            src={leftAvatarUrl}
            alt={leftName}
            fill
            className="rounded-full object-cover border-[3px] border-primary-50"
          />
        </div>
      </div>
    ) : (
      <div className="w-20 h-20 flex items-center justify-center">
        <Question />
      </div>
    )}

    <div className="flex items-center gap-5">
      {!isComputerGame && (
        <div className="flex flex-col items-center">
          <span className="text-5xl font-bold font-MachineStd">{amount}</span>
          <div className="flex items-center gap-1">
            <Image
              src={"/images/usdc-logo.webp"}
              alt="USDC"
              className="max-sm:size-5 size-7"
              width={28}
              height={28}
              quality={75}
            />
            <span className="text-lg font-medium uppercase">USDC</span>
          </div>
        </div>
      )}
      <span className="text-4xl text-[clamp(18px,5vw,22px)] font-bold">X</span>
      {!isComputerGame && (
        <div className="flex flex-col items-center">
          <span className="text-5xl font-bold font-MachineStd">{amount}</span>
          <div className="flex items-center gap-1">
            <Image
              src="/images/usdc-logo.webp"
              alt="USDC"
              className="max-sm:size-5 size-7"
              width={28}
              height={28}
              quality={75}
            />
            <span className="text-lg font-medium uppercase">USDC</span>
          </div>
        </div>
      )}
    </div>

    {rightName && rightAvatarUrl ? (
      <div className="flex flex-col items-center">
        <span className="mb-2 text-[clamp(10px,5vw,16px)] font-bold uppercase">
          {rightName}
        </span>
        <div className="relative w-20 h-20">
          <Image
            src={rightAvatarUrl}
            alt={rightName}
            fill
            className="rounded-full object-cover border-[3px] border-primary-50"
          />
        </div>
      </div>
    ) : (
      <div className="w-20 h-20 flex items-center justify-center">
        <Question />
      </div>
    )}
  </div>
);

export default StakeOverview;
