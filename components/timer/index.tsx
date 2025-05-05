"use client";
import { useEffect, useState } from "react";

const KPTimer = ({ initialSeconds = 60 }: IKPTimer) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (seconds <= 0) {
      setSeconds(initialSeconds);
      return;
    }

    const timer = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds, initialSeconds]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (totalSeconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  return (
    <div className="text-primary-50 text-[24px] lg:text-[28px] xl:text-[32px] leading-none font-MachineStd">
      {formatTime(seconds)}
    </div>
  );
};

export default KPTimer;
