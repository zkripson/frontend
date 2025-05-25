import React from "react";
import classNames from "classnames";
import { CheckAltIcon } from "@/public/icons";
import KPButton from "../button";

export interface IKPProgressClaimButtonProps {
  /** Percentage remaining (0–100) */
  percentage: number;
  /** Button state: 'locked', 'claimable', or 'claimed' */
  status: "locked" | "claimable" | "claimed";
  /** Handler for claim action when status==='claimable' */
  onClaim?: () => void;
  /** Additional container classes */
  className?: string;
}

const KPProgressClaimButton: React.FC<IKPProgressClaimButtonProps> = ({
  percentage,
  status,
  onClaim,
  className,
}) => {
  const pct = Math.max(0, Math.min(percentage, 100));

  // Colors for track and fill
  const trackColor = status === "locked" ? "bg-[#FCD8A5]" : "bg-gray-700";
  const fillColor = status !== "locked" ? "bg-[#76DA72]" : "bg-[#C34B4B]";

  return (
    <div
      className={classNames(
        "w-full max-sm:max-w-24 max-w-[141px] flex flex-col gap-1 relative",
        className
      )}
    >
      {/* Progress Bar */}
      <div
        className={classNames(
          "w-full h-2 rounded-full overflow-hidden opacity-30",
          trackColor
        )}
      >
        <div
          className={classNames(
            "h-full rounded-full border border-primary-300",
            fillColor
          )}
          style={{ width: `${100 - pct}%` }}
        />
      </div>

      {/* State-specific Action */}
      {status === "claimable" && (
        <KPButton
          type="button"
          onClick={onClaim}
          disabled={false}
          title="Claim Now"
          isMachine
          small
          fullWidth
          className="max-sm:h-8 h-10 opacity-30"
        />
      )}

      {status === "claimed" && (
        <div className="flex items-center justify-center gap-1 bg-[#63431D] rounded max-sm:h-8 h-10">
          <span className="font-MachineStd text-[20px] leading-[100%] -mb-1 text-white">
            Claimed
          </span>
          <CheckAltIcon />
        </div>
      )}

      {status === "locked" && (
        <div className="bg-transparent border border-[#44190C52] flex items-center justify-center rounded max-sm:h-8 h-10">
          <span className="font-MachineStd text-[16px] leading-[100%] -mb-1 text-white">
            {pct}% LEFT
          </span>
        </div>
      )}

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-material px-4 py-1.5 border border-primary-600 rounded-full text-primary-600 text-[clamp(8px,5vw,10px)] leading-none whitespace-nowrap">
          Coming Soon
        </div>
      </div>
    </div>
  );
};

export default KPProgressClaimButton;
