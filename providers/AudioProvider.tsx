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
  bg: new Howl({
    src: ["/sounds/bg-music.mp3"],
    loop: true,
    volume: 0,
  }),
  hit: new Howl({ src: ["/sounds/hit.mp3"], volume: 1.0 }),
  miss: new Howl({ src: ["/sounds/miss.mp3"], volume: 0.8 }),
  place: new Howl({ src: ["/sounds/place.mp3"], volume: 0.1 }),
  timer: new Howl({ src: ["/sounds/timer-ticks.mp3"], volume: 0.1 }),
  // Voiceovers and additional sounds
  miss_voiceover: new Howl({
    src: ["/sounds/miss_voiceover.mp3"],
    volume: 0.7,
  }),
  game_start_voiceover: new Howl({
    src: ["/sounds/game_start_voiceover.mp3"],
    volume: 0.7,
  }),
  another_hit_voiceover: new Howl({
    src: ["/sounds/another_hit_voiceover.mp3"],
    volume: 0.7,
  }),
  sunk_voiceover: new Howl({
    src: ["/sounds/sunk_voiceover.mp3"],
    volume: 0.7,
  }),
  hit_voiceover: new Howl({ src: ["/sounds/hit_voiceover.mp3"], volume: 0.7 }),
  game_over_voiceover: new Howl({
    src: ["/sounds/game_over_voiceover.mp3"],
    volume: 0.7,
  }),
  waiting_voiceover: new Howl({
    src: ["/sounds/waiting_voiceover.mp3"],
    volume: 0.7,
  }),
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
      if (unlocked.current) sounds.bg.stop();
    };
  }, []);

  const unlock = () => {
    if (unlocked.current) return;
    if (Howler.ctx.state === "suspended") Howler.ctx.resume();
    sounds.bg.volume(0);
    sounds.bg.play();
    sounds.bg.fade(0, 0.08, 3000);
    unlocked.current = true;
  };

  const fadeOut = () => {
    if (!unlocked.current) return;
    sounds.bg.fade(sounds.bg.volume(), 0, 2000);
    setTimeout(() => {
      sounds.bg.stop();
      unlocked.current = false;
    }, 2000);
  };

  const value: AudioContextValue = {
    unlock,
    play: (key) => {
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
