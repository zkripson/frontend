"use client";
import React, { createContext, useContext, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Howl, Howler } from "howler";

const soundConfig = {
  bg: { src: ["/sounds/bg-music.mp3"], loop: true, volume: 0 },
  hit: { src: ["/sounds/hit.mp3"], volume: 1.0 },
  miss: { src: ["/sounds/miss.mp3"], volume: 0.8 },
  place: { src: ["/sounds/place.mp3"], volume: 0.1 },
  timer: { src: ["/sounds/timer-ticks.mp3"], volume: 0.1 },
  hit_voiceover: { src: ["/sounds/hit_voiceover.mp3"], volume: 0.7 },
  player_missed_voiceover: {
    src: ["/sounds/player_missed_voiceover.mp3"],
    volume: 0.7,
  },
  opponent_hit_voiceover: {
    src: ["/sounds/opponent_hit_voiceover.mp3"],
    volume: 0.7,
  },
  missed_voiceover: { src: ["/sounds/missed_voiceover.mp3"], volume: 0.7 },
  game_start_voiceover: {
    src: ["/sounds/game_start_voiceover.mp3"],
    volume: 0.7,
  },
  another_hit_voiceover: {
    src: ["/sounds/another_hit_voiceover.mp3"],
    volume: 0.7,
  },
  sunk_voiceover: { src: ["/sounds/sunk_voiceover.mp3"], volume: 0.7 },
  sunk_carrier_voiceover: {
    src: ["/sounds/sunk_carrier_voiceover.mp3"],
    volume: 0.7,
  },
  sunk_battleship_voiceover: {
    src: ["/sounds/sunk_battleship_voiceover.mp3"],
    volume: 0.7,
  },
  sunk_cruiser_voiceover: {
    src: ["/sounds/sunk_cruiser_voiceover.mp3"],
    volume: 0.7,
  },
  sunk_submarine_voiceover: {
    src: ["/sounds/sunk_submarine_voiceover.mp3"],
    volume: 0.7,
  },
  sunk_destroyer_voiceover: {
    src: ["/sounds/sunk_destroyer_voiceover.mp3"],
    volume: 0.7,
  },
  opponent_sunk_voiceover: {
    src: ["/sounds/opponent_sunk_voiceover.mp3"],
    volume: 0.7,
  },
  opponent_sunk_carrier_voiceover: {
    src: ["/sounds/opponent_sunk_carrier_voiceover.mp3"],
    volume: 0.7,
  },
  opponent_sunk_battleship_voiceover: {
    src: ["/sounds/opponent_sunk_battleship_voiceover.mp3"],
    volume: 0.7,
  },
  opponent_sunk_cruiser_voiceover: {
    src: ["/sounds/opponent_sunk_cruiser_voiceover.mp3"],
    volume: 0.7,
  },
  opponent_sunk_submarine_voiceover: {
    src: ["/sounds/opponent_sunk_submarine_voiceover.mp3"],
    volume: 0.7,
  },
  opponent_sunk_destroyer_voiceover: {
    src: ["/sounds/opponent_sunk_destroyer_voiceover.mp3"],
    volume: 0.7,
  },
  game_over_voiceover: {
    src: ["/sounds/game_over_voiceover.mp3"],
    volume: 0.7,
  },
  waiting_voiceover: { src: ["/sounds/waiting_voiceover.mp3"], volume: 0.7 },
  game_draw_restart_voiceover: {
    src: ["/sounds/game_draw_restart_voiceover.mp3"],
    volume: 0.7,
  },
  you_lost_voiceover: { src: ["/sounds/you_lost_voiceover.mp3"], volume: 0.7 },
  you_won_voiceover: { src: ["/sounds/you_won_voiceover.mp3"], volume: 0.7 },
  coins: { src: ["/sounds/coins.mp3"], volume: 0.7 },
  opponent_joined_voiceover: {
    src: ["/sounds/opponent_joined_voiceover.mp3"],
    volume: 0.7,
  },
};

type SoundKey = keyof typeof soundConfig;

interface AudioContextValue {
  unlock: () => void;
  play: (key: SoundKey) => void;
  setVolume: (vol: number) => void;
  mute: () => void;
  unmute: () => void;
  stop: (key: SoundKey) => void;
}

const AudioContext = createContext<AudioContextValue | null>(null);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const pathname = usePathname();
  const unlocked = useRef(false);
  const soundsRef = useRef<{ [key: string]: Howl }>({});

  // Instantiate all sounds once on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const newSounds: { [key: string]: Howl } = {};
      Object.entries(soundConfig).forEach(([key, config]) => {
        newSounds[key] = new Howl(config);
      });
      soundsRef.current = newSounds;
    }
    return () => {
      Object.values(soundsRef.current).forEach((howl) => howl?.unload());
    };
  }, []);

  // Play/fade music based on route
  useEffect(() => {
    const isSessionPage = /^\/[0-9a-fA-F-]{36}$/.test(pathname || "");
    if (isSessionPage) {
      unlock();
    } else {
      fadeOut();
    }
  }, [pathname]);

  // Resume audio context on user interaction
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

  // Stop bg music on unmount
  useEffect(() => {
    return () => {
      if (unlocked.current && soundsRef.current.bg) soundsRef.current.bg.stop();
    };
  }, []);

  const unlock = () => {
    if (unlocked.current) return;
    if (Howler.ctx.state === "suspended") Howler.ctx.resume();
    if (soundsRef.current.bg) {
      soundsRef.current.bg.volume(0);
      soundsRef.current.bg.play();
      soundsRef.current.bg.fade(0, 0.08, 3000);
    }
    unlocked.current = true;
  };

  const fadeOut = () => {
    if (!unlocked.current) return;
    if (soundsRef.current.bg) {
      soundsRef.current.bg.fade(soundsRef.current.bg.volume(), 0, 2000);
      setTimeout(() => {
        if (soundsRef.current.bg) soundsRef.current.bg.stop();
        unlocked.current = false;
      }, 2000);
    }
  };

  const value: AudioContextValue = {
    unlock,
    play: (key) => {
      if (typeof window === "undefined" || !soundsRef.current[key]) return;
      if (Howler.ctx.state === "suspended") Howler.ctx.resume();
      soundsRef.current[key].play();
    },
    setVolume: Howler.volume.bind(Howler),
    mute: () => Howler.mute(true),
    unmute: () => Howler.mute(false),
    stop: (key) => {
      if (typeof window === "undefined" || !soundsRef.current[key]) return;
      soundsRef.current[key].stop();
    },
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
