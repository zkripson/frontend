"use client";
import React, { useEffect, useState, useRef } from "react";
import { useAudio } from "@/providers/AudioProvider";
import { Howl } from "howler";
// Get the timer sound instance for direct control
import { sounds } from "@/providers/AudioProvider";

interface KPTimerProps {
  turnStartedAt?: number;
  turnDuration?: number;
  onExpire?: () => void;
}

const KPTimer: React.FC<KPTimerProps> = ({
  turnStartedAt,
  turnDuration = 15_000, // 15 seconds per turn
  onExpire,
}) => {
  const [remaining, setRemaining] = useState(turnDuration);
  const expiredRef = useRef(false);
  const playedTimerRef = useRef(false);
  const audio = useAudio();

  const formatTime = (ms: number) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  useEffect(() => {
    let timerSoundTimeout: ReturnType<typeof setTimeout> | null = null;
    if (typeof turnStartedAt !== "number") {
      setRemaining(turnDuration);
      expiredRef.current = false;
      playedTimerRef.current = false;
      if (sounds && sounds.timer && typeof sounds.timer.stop === "function")
        sounds.timer.stop();
      if (timerSoundTimeout) clearTimeout(timerSoundTimeout);
      return;
    }

    expiredRef.current = false;
    playedTimerRef.current = false;
    if (sounds && sounds.timer && typeof sounds.timer.stop === "function")
      sounds.timer.stop();
    if (timerSoundTimeout) clearTimeout(timerSoundTimeout);

    const updateRemaining = () => {
      const elapsed = Date.now() - turnStartedAt;
      const rem = Math.max(0, turnDuration - elapsed);

      setRemaining(rem);

      // Play timer sound only when entering <=5s window, and start a 5s timeout to stop it
      if (rem <= 5_000 && !playedTimerRef.current) {
        audio.play("timer");
        playedTimerRef.current = true;
        timerSoundTimeout = setTimeout(() => {
          if (sounds && sounds.timer && typeof sounds.timer.stop === "function")
            sounds.timer.stop();
          playedTimerRef.current = false;
        }, 5000);
      }

      if (rem <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        if (sounds && sounds.timer && typeof sounds.timer.stop === "function")
          sounds.timer.stop();
        if (timerSoundTimeout) clearTimeout(timerSoundTimeout);
        onExpire?.();
      }
    };

    updateRemaining();
    const iv = window.setInterval(updateRemaining, 200);
    return () => {
      clearInterval(iv);
      if (sounds && sounds.timer && typeof sounds.timer.stop === "function")
        sounds.timer.stop();
      if (timerSoundTimeout) clearTimeout(timerSoundTimeout);
    };
  }, [turnStartedAt, turnDuration, onExpire, audio]);

  let colorClass = "text-primary-50";
  if (remaining <= 5_000) colorClass = "text-red-500";
  else if (remaining <= 10_000) colorClass = "text-yellow-400";

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
