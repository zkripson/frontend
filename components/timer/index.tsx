"use client";
import React, { useEffect, useState, useRef } from "react";
import { useAudio } from "@/providers/AudioProvider";
import { Howl } from "howler";

interface KPTimerProps {
  turnStartedAt?: number;
  turnDuration?: number;
  onExpire?: () => void;
  isGame?: boolean;
}

const KPTimer: React.FC<KPTimerProps> = ({
  turnStartedAt,
  turnDuration = 10_000, // 10 seconds per turn
  onExpire,
  isGame,
}) => {
  // 2 minute game timer (180000 ms)
  const GAME_DURATION = 120_000;
  const [remaining, setRemaining] = useState(
    isGame ? GAME_DURATION : turnDuration
  );
  const expiredRef = useRef(false);
  const playedTimerRef = useRef(false);
  const audio = useAudio();
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
  // NEW: Use a ref for gameOver so all closures see the latest value
  const gameOverRef = useRef(false);

  // FIX: Use Math.floor instead of Math.ceil to avoid 00:16 flicker
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  useEffect(() => {
    let timerSoundTimeout: ReturnType<typeof setTimeout> | null = null;
    let gameStart = Date.now();
    let lastGameRem = GAME_DURATION;
    // Remove local gameOver, use ref instead
    gameOverRef.current = false;

    // Helper to force everything to 0
    const forceZero = () => {
      setRemaining(0);
      gameOverRef.current = true;
      expiredRef.current = true;
      audio.stop("timer");
      if (timerSoundTimeout) clearTimeout(timerSoundTimeout);
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    };

    if (isGame) {
      setRemaining(GAME_DURATION);
      expiredRef.current = false;
      playedTimerRef.current = false;
      audio.stop("timer");
      if (timerSoundTimeout) clearTimeout(timerSoundTimeout);
      gameStart = Date.now();
      lastGameRem = GAME_DURATION;
      gameOverRef.current = false;
      const update = () => {
        const elapsed = Date.now() - gameStart;
        const rem = Math.max(0, GAME_DURATION - elapsed);
        if (rem !== lastGameRem) setRemaining(rem);
        lastGameRem = rem;
        if (rem <= 5_000 && !playedTimerRef.current && !gameOverRef.current) {
          audio.play("timer");
          playedTimerRef.current = true;
          timerSoundTimeout = setTimeout(() => {
            audio.stop("timer");
            playedTimerRef.current = false;
          }, 5000);
        }
        if (rem <= 0 && !expiredRef.current) {
          forceZero();
          onExpire?.();
        }
      };
      update();
      gameTimerRef.current = setInterval(update, 200);
      return () => {
        if (gameTimerRef.current) clearInterval(gameTimerRef.current);
        audio.stop("timer");
        if (timerSoundTimeout) clearTimeout(timerSoundTimeout);
      };
    }

    // NON-GAME MODE: normal turn timer, but also track a 3-min game timer
    if (typeof turnStartedAt !== "number") {
      setRemaining(turnDuration);
      expiredRef.current = false;
      playedTimerRef.current = false;
      audio.stop("timer");
      if (timerSoundTimeout) clearTimeout(timerSoundTimeout);
      gameStart = Date.now();
      lastGameRem = GAME_DURATION;
      gameOverRef.current = false;
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
      // Start 2-min timer
      gameTimerRef.current = setInterval(() => {
        const elapsed = Date.now() - gameStart;
        const rem = Math.max(0, GAME_DURATION - elapsed);
        if (rem <= 0 && !gameOverRef.current) {
          forceZero();
        }
      }, 200);
      return () => {
        if (gameTimerRef.current) clearInterval(gameTimerRef.current);
        audio.stop("timer");
        if (timerSoundTimeout) clearTimeout(timerSoundTimeout);
      };
    }

    expiredRef.current = false;
    playedTimerRef.current = false;
    audio.stop("timer");
    if (timerSoundTimeout) clearTimeout(timerSoundTimeout);
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    const turnStart = turnStartedAt;
    let lastRem = turnDuration;
    gameOverRef.current = false;
    const updateRemaining = () => {
      const elapsed = Date.now() - turnStart;
      const rem = Math.max(0, turnDuration - elapsed);
      // If the 3-min game timer is up, force turn timer to 0
      if (gameOverRef.current) {
        setRemaining(0);
        return;
      }
      if (rem !== lastRem) setRemaining(rem);
      lastRem = rem;
      if (rem <= 5_000 && !playedTimerRef.current) {
        audio.play("timer");
        playedTimerRef.current = true;
        timerSoundTimeout = setTimeout(() => {
          audio.stop("timer");
          playedTimerRef.current = false;
        }, 5000);
      }
      if (rem <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        audio.stop("timer");
        if (timerSoundTimeout) clearTimeout(timerSoundTimeout);
        onExpire?.();
      }
    };
    updateRemaining();
    // 3-min game timer
    gameTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - gameStart;
      const rem = Math.max(0, GAME_DURATION - elapsed);
      if (rem <= 0 && !gameOverRef.current) {
        gameOverRef.current = true;
        setRemaining(0);
      }
    }, 200);
    const iv = window.setInterval(updateRemaining, 200);
    return () => {
      clearInterval(iv);
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
      audio.stop("timer");
      if (timerSoundTimeout) clearTimeout(timerSoundTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGame, turnStartedAt, turnDuration, audio]);

  let colorClass = "text-primary-50";
  if (remaining <= 5_000) colorClass = "text-red-500";
  else if (remaining <= 10_000) colorClass = "text-yellow-400";

  return (
    <div
      className={`font-MachineStd leading-none ${colorClass}
                  text-[24px] lg:text-[28px] xl:text-[32px] -mb-2`}
    >
      {formatTime(remaining)}
    </div>
  );
};

export default KPTimer;
