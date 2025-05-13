"use client";
import React, { useEffect, useState, useRef } from "react";

interface KPTimerProps {
  turnStartedAt?: number;
  turnDuration?: number;
  onExpire?: () => void;
}

const KPTimer: React.FC<KPTimerProps> = ({
  turnStartedAt,
  turnDuration = 15_000,
  onExpire,
}) => {
  const [remaining, setRemaining] = useState(turnDuration);
  const expiredRef = useRef(false);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  useEffect(() => {
    if (typeof turnStartedAt !== "number") {
      setRemaining(turnDuration);
      return;
    }

    expiredRef.current = false;

    const updateRemaining = () => {
      const elapsed = Date.now() - turnStartedAt;
      const rem = Math.max(0, turnDuration - elapsed);
      setRemaining(rem);
      if (rem <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpire?.();
      }
    };

    updateRemaining();
    const iv = window.setInterval(updateRemaining, 200);
    return () => clearInterval(iv);
  }, [turnStartedAt, turnDuration, onExpire]);

  let colorClass = "text-primary-50";
  if (remaining <= 3_000) colorClass = "text-red-500";
  else if (remaining <= 5_000) colorClass = "text-yellow-400";

  return (
    <div
      className={`font-MachineStd leading-none ${colorClass}
                  text-[24px] lg:text-[28px] xl:text-[32px]`}
    >
      {formatTime(remaining)}
    </div>
  );
};

export default KPTimer;
