import { useEffect, useState } from "react";
import Image from "next/image";
import useSystemFunctions from "@/hooks/useSystemFunctions";
import { usePlayerActions } from "@/store/player/actions";

interface QuickGameFoundProps {
  countdown: number | null;
}

export default function QuickGameFound({ countdown }: QuickGameFoundProps) {
  const {
    matchmakingState: { matchmaking },
    playerState: { opponentProfile },
  } = useSystemFunctions();
  const { getOpponentProfile } = usePlayerActions();

  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    if (!matchmaking?.opponent) return;

    setLoadingProfile(true);
    getOpponentProfile(matchmaking.opponent).finally(() => {
      setLoadingProfile(false);
    });
  }, [matchmaking?.opponent, getOpponentProfile]);

  return (
    <div className="flex flex-col gap-4 items-center mt-20">
      <div className="flex flex-col items-center mb-5">
        {loadingProfile || !opponentProfile ? (
          <div
            className="
            size-[70px] max-sm:size-14 
            rounded-full bg-primary-700 
            animate-pulse
          "
          />
        ) : (
          <>
            <Image
              src={opponentProfile.avatar}
              alt={opponentProfile.username}
              width={70}
              height={70}
              quality={100}
              className="rounded-full object-cover size-[70px] max-sm:size-14"
            />
            <p className="mt-2 text-[18px] max-sm:text-[16px] font-medium text-primary-50">
              {opponentProfile.username}
            </p>
          </>
        )}
      </div>

      <h1 className="text-[26px] max-sm:text-[20px] leading-none font-MachineStd text-primary-50 uppercase">
        Opponent Found
      </h1>

      {countdown !== null && countdown > 0 ? (
        <p className="text-[18px] max-sm:text-[14px] leading-none text-primary-50 text-center">
          Game starts in {countdown}…
        </p>
      ) : (
        <p className="text-[18px] max-sm:text-[14px] leading-none text-primary-50 text-center">
          Connecting…
        </p>
      )}
    </div>
  );
}
