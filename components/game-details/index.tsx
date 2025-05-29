import classNames from "classnames";

import useSystemFunctions from "@/hooks/useSystemFunctions";
import ExpiryCountdown from "./expiry-countdown";

const KPGameDetails = ({ invitation, isSmall }: IKPGameDetails) => {
  const {
    playerState: { opponentProfile },
  } = useSystemFunctions();

  const creator = opponentProfile?.username
    ? opponentProfile.username
    : `${invitation.creator.slice(0, 6)}...${invitation.creator.slice(-4)}`;
  return (
    <div
      className={classNames(
        "flex flex-col items-center bg-primary-1200 border border-primary-450 border-dashed rounded-2xl w-full",
        isSmall ? "gap-2 p-2" : "gap-3 p-3 md:p-4 lg:p-6"
      )}
    >
      <div className="flex justify-between w-full">
        <span
          className={classNames(
            "text-primary-50",
            isSmall ? "text-[10px]" : "text-xs lg:text-sm"
          )}
        >
          Game Type
        </span>
        <span
          className={classNames(
            "text-white font-bold",
            isSmall ? "text-xs" : "text-sm lg:text-base"
          )}
        >
          {invitation.isBettingGame ? "Betting Game" : "Regular Game"}
        </span>
      </div>

      {invitation.isBettingGame && invitation.stakeAmount && (
        <div className="flex justify-between w-full">
          <span
            className={classNames(
              "text-primary-50",
              isSmall ? "text-[10px]" : "text-xs lg:text-sm"
            )}
          >
            Stake Amount
          </span>
          <span
            className={classNames(
              "text-white font-bold",
              isSmall ? "text-xs" : "text-sm lg:text-base"
            )}
          >
            {invitation.stakeAmount} USDC
          </span>
        </div>
      )}

      <div className="flex justify-between w-full">
        <span
          className={classNames(
            "text-primary-50",
            isSmall ? "text-[10px]" : "text-xs lg:text-sm"
          )}
        >
          Created By
        </span>
        <span
          className={classNames(
            "text-white font-bold",
            isSmall ? "text-xs" : "text-sm lg:text-base"
          )}
        >
          {creator}
        </span>
      </div>

      <div className="flex justify-between w-full">
        <span
          className={classNames(
            "text-primary-50",
            isSmall ? "text-[10px]" : "text-xs lg:text-sm"
          )}
        >
          Expires In
        </span>
        <span
          className={classNames(
            "text-white font-bold",
            isSmall ? "text-xs" : "text-sm lg:text-base"
          )}
        >
          <ExpiryCountdown createdAt={invitation.createdAt} />
        </span>
      </div>
    </div>
  );
};

export default KPGameDetails;
