"use client";
import React, { createContext, useContext, useEffect, useRef } from "react";
import { Howl, Howler } from "howler";

interface AudioContextValue {
  play: (key: keyof typeof sounds) => void;
  setVolume: (vol: number) => void;
  mute: () => void;
  unmute: () => void;
}

const AudioContext = createContext<AudioContextValue | null>(null);

const sounds = {
  bg: new Howl({ src: ["/sounds/bg-music.mp3"], loop: true, volume: 0.08 }),
  hit: new Howl({ src: ["/sounds/hit.wav"], volume: 1.0 }),
  miss: new Howl({ src: ["/sounds/miss.wav"], volume: 0.8 }),
  shot: new Howl({ src: ["/sounds/shot.wav"], volume: 0.9 }),
  victory: new Howl({ src: ["/sounds/victory.mp3"], volume: 0.6 }),
};

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const unlocked = useRef(false);

  useEffect(() => {
    const resumeOnFirstClick = () => {
      if (Howler.ctx.state === "suspended") {
        Howler.ctx.resume();
      }
      sounds.bg.play();
      unlocked.current = true;
    };

    document.addEventListener("click", resumeOnFirstClick, { once: true });

    return () => {
      document.removeEventListener("click", resumeOnFirstClick);
      if (unlocked.current) {
        sounds.bg.stop();
      }
    };
  }, []);

  const value: AudioContextValue = {
    play: (key) => {
      if (Howler.ctx.state === "suspended") {
        Howler.ctx.resume();
      }
      sounds[key].play();
    },
    setVolume: (vol) => Howler.volume(vol),
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
