"use client";
import React, { createContext, useContext, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Howl, Howler } from "howler";

interface AudioContextValue {
  unlock: () => void;
  play: (key: keyof typeof sounds) => void;
  setVolume: (vol: number) => void;
  mute: () => void;
  unmute: () => void;
}

const AudioContext = createContext<AudioContextValue | null>(null);

export const sounds = {
  bg:
    typeof window !== "undefined"
      ? new Howl({ src: ["/sounds/bg-music.mp3"], loop: true, volume: 0 })
      : undefined,
  hit:
    typeof window !== "undefined"
      ? new Howl({ src: ["/sounds/hit.mp3"], volume: 1.0 })
      : undefined,
  miss:
    typeof window !== "undefined"
      ? new Howl({ src: ["/sounds/miss.mp3"], volume: 0.8 })
      : undefined,
  place:
    typeof window !== "undefined"
      ? new Howl({ src: ["/sounds/place.mp3"], volume: 0.1 })
      : undefined,
  timer:
    typeof window !== "undefined"
      ? new Howl({ src: ["/sounds/timer-ticks.mp3"], volume: 0.1 })
      : undefined,
  // Voiceovers and additional sounds
  miss_voiceover:
    typeof window !== "undefined"
      ? new Howl({ src: ["/sounds/miss_voiceover.mp3"], volume: 0.7 })
      : undefined,
  hit_voiceover:
    typeof window !== "undefined"
      ? new Howl({ src: ["/sounds/hit_voiceover.mp3"], volume: 0.7 })
      : undefined,
  player_missed_voiceover:
    typeof window !== "undefined"
      ? new Howl({ src: ["/sounds/player_missed_voiceover.mp3"], volume: 0.7 })
      : undefined,
  opponent_hit_voiceover:
    typeof window !== "undefined"
      ? new Howl({ src: ["/sounds/opponent_hit_voiceover.mp3"], volume: 0.7 })
      : undefined,
  missed_voiceover:
    typeof window !== "undefined"
      ? new Howl({ src: ["/sounds/missed_voiceover.mp3"], volume: 0.7 })
      : undefined,
  game_start_voiceover:
    typeof window !== "undefined"
      ? new Howl({ src: ["/sounds/game_start_voiceover.mp3"], volume: 0.7 })
      : undefined,
  another_hit_voiceover:
    typeof window !== "undefined"
      ? new Howl({ src: ["/sounds/another_hit_voiceover.mp3"], volume: 0.7 })
      : undefined,
  sunk_voiceover:
    typeof window !== "undefined"
      ? new Howl({ src: ["/sounds/sunk_voiceover.mp3"], volume: 0.7 })
      : undefined,
  sunk_carrier_voiceover:
    typeof window !== "undefined"
      ? new Howl({ src: ["/sounds/sunk_carrier_voiceover.mp3"], volume: 0.7 })
      : undefined,
  sunk_battleship_voiceover:
    typeof window !== "undefined"
      ? new Howl({
          src: ["/sounds/sunk_battleship_voiceover.mp3"],
          volume: 0.7,
        })
      : undefined,
  sunk_cruiser_voiceover:
    typeof window !== "undefined"
      ? new Howl({ src: ["/sounds/sunk_cruiser_voiceover.mp3"], volume: 0.7 })
      : undefined,
  sunk_submarine_voiceover:
    typeof window !== "undefined"
      ? new Howl({ src: ["/sounds/sunk_submarine_voiceover.mp3"], volume: 0.7 })
      : undefined,
  sunk_destroyer_voiceover:
    typeof window !== "undefined"
      ? new Howl({ src: ["/sounds/sunk_destroyer_voiceover.mp3"], volume: 0.7 })
      : undefined,
  opponent_sunk_voiceover:
    typeof window !== "undefined"
      ? new Howl({ src: ["/sounds/opponent_sunk_voiceover.mp3"], volume: 0.7 })
      : undefined,
  opponent_sunk_carrier_voiceover:
    typeof window !== "undefined"
      ? new Howl({
          src: ["/sounds/opponent_sunk_carrier_voiceover.mp3"],
          volume: 0.7,
        })
      : undefined,
  opponent_sunk_battleship_voiceover:
    typeof window !== "undefined"
      ? new Howl({
          src: ["/sounds/opponent_sunk_battleship_voiceover.mp3"],
          volume: 0.7,
        })
      : undefined,
  opponent_sunk_cruiser_voiceover:
    typeof window !== "undefined"
      ? new Howl({
          src: ["/sounds/opponent_sunk_cruiser_voiceover.mp3"],
          volume: 0.7,
        })
      : undefined,
  opponent_sunk_submarine_voiceover:
    typeof window !== "undefined"
      ? new Howl({
          src: ["/sounds/opponent_sunk_submarine_voiceover.mp3"],
          volume: 0.7,
        })
      : undefined,
  opponent_sunk_destroyer_voiceover:
    typeof window !== "undefined"
      ? new Howl({
          src: ["/sounds/opponent_sunk_destroyer_voiceover.mp3"],
          volume: 0.7,
        })
      : undefined,
  game_over_voiceover:
    typeof window !== "undefined"
      ? new Howl({ src: ["/sounds/game_over_voiceover.mp3"], volume: 0.7 })
      : undefined,
  waiting_voiceover:
    typeof window !== "undefined"
      ? new Howl({ src: ["/sounds/waiting_voiceover.mp3"], volume: 0.7 })
      : undefined,
  game_draw_restart_voiceover:
    typeof window !== "undefined"
      ? new Howl({
          src: ["/sounds/game_draw_restart_voiceover.mp3"],
          volume: 0.7,
        })
      : undefined,
  you_lost_voiceover:
    typeof window !== "undefined"
      ? new Howl({ src: ["/sounds/you_lost_voiceover.mp3"], volume: 0.7 })
      : undefined,
  you_won_voiceover:
    typeof window !== "undefined"
      ? new Howl({ src: ["/sounds/you_won_voiceover.mp3"], volume: 0.7 })
      : undefined,
  coins:
    typeof window !== "undefined"
      ? new Howl({ src: ["/sounds/coins.mp3"], volume: 0.7 })
      : undefined,
};

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const pathname = usePathname();
  const unlocked = useRef(false);

  useEffect(() => {
    const isSessionPage = /^\/[0-9a-fA-F-]{36}$/.test(pathname || "");
    if (isSessionPage) {
      unlock();
    } else {
      fadeOut();
    }
  }, [pathname]);

  useEffect(() => {
    const resumeOnInteract = () => {
      const isSessionPage = /^\/[0-9a-fA-F-]{36}$/.test(pathname || "");
      if (
        isSessionPage &&
        !unlocked.current &&
        Howler.ctx.state === "suspended"
      ) {
        unlock();
      }
    };

    window.addEventListener("pointerdown", resumeOnInteract, { once: true });
    window.addEventListener("keydown", resumeOnInteract, { once: true });

    return () => {
      window.removeEventListener("pointerdown", resumeOnInteract);
      window.removeEventListener("keydown", resumeOnInteract);
    };
  }, [pathname]);

  useEffect(() => {
    return () => {
      if (unlocked.current && sounds.bg) sounds.bg.stop();
    };
  }, []);

  const unlock = () => {
    if (unlocked.current) return;
    if (Howler.ctx.state === "suspended") Howler.ctx.resume();
    if (sounds.bg) {
      sounds.bg.volume(0);
      sounds.bg.play();
      sounds.bg.fade(0, 0.08, 3000);
    }
    unlocked.current = true;
  };

  const fadeOut = () => {
    if (!unlocked.current) return;
    if (sounds.bg) {
      sounds.bg.fade(sounds.bg.volume(), 0, 2000);
      setTimeout(() => {
        if (sounds.bg) sounds.bg.stop();
        unlocked.current = false;
      }, 2000);
    }
  };

  const value: AudioContextValue = {
    unlock,
    play: (key) => {
      if (typeof window === "undefined" || !sounds[key]) return;
      if (Howler.ctx.state === "suspended") Howler.ctx.resume();
      sounds[key].play();
    },
    setVolume: Howler.volume.bind(Howler),
    mute: () => Howler.mute(true),
    unmute: () => Howler.mute(false),
  };

  return (
    <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
  );
};

export const useAudio = () => {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error("useAudio must be inside AudioProvider");
  return ctx;
};
