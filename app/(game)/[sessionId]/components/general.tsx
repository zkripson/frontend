"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useScreenDetect } from "@/hooks/useScreenDetect";
import { useAudio } from "@/providers/AudioProvider";

const messages = {
  "game-start": "game start",
  waiting: "waiting for opponent ⏳",
  missed: "opponent missed!",
  hit: ["you hit!", "another hit!"],
  sunk: "GREAT! YOU SUNK THEIR SHIP",
} as const;

export type GeneralMessageKey = keyof typeof messages;

interface GeneralProps {
  messageKey: GeneralMessageKey | null;
  uniqueId?: number;
}

export default function General({ messageKey, uniqueId }: GeneralProps) {
  // pull in your mobile-detect flags
  const { isXSmall, isSmall } = useScreenDetect();
  const isMobile = isXSmall || isSmall;

  // figure out which string to display
  const msg = messages[messageKey!];
  const isArray = Array.isArray(msg);
  const [hitIndex, setHitIndex] = useState(0);
  const prevKey = useRef<GeneralMessageKey>(messageKey);
  const audio = useAudio();
  const playedRef = useRef<{
    key: GeneralMessageKey | null;
    uniqueId?: number;
  }>({ key: null, uniqueId: undefined });

  const msgLength = msg && Array.isArray(msg) ? msg.length : 0;
  useEffect(() => {
    if (!messageKey) return;
    if (
      messageKey === "hit" &&
      prevKey.current === "hit" &&
      msg &&
      Array.isArray(msg)
    ) {
      setHitIndex((i) => (i + 1) % msg.length);
    }
    prevKey.current = messageKey;
  }, [messageKey, msg, msgLength, uniqueId]);

  useEffect(() => {
    if (!messageKey) return;
    // Only play if messageKey or uniqueId changes and show is true
    if (
      playedRef.current.key !== messageKey ||
      playedRef.current.uniqueId !== uniqueId
    ) {
      if (messageKey === "waiting") audio.play("waiting_voiceover");
      else if (messageKey === "missed") audio.play("miss_voiceover");
      else if (messageKey === "hit") audio.play("hit_voiceover");
      else if (messageKey === "sunk") audio.play("sunk_voiceover");
      else if (messageKey === "game-start") audio.play("game_start_voiceover");
      playedRef.current = { key: messageKey, uniqueId };
    }
  }, [messageKey, uniqueId, audio]);

  useEffect(() => {
    // This effect will run on every uniqueId change, even if messageKey is the same
  }, [uniqueId]);

  const displayText = isArray ? msg[hitIndex] : (msg as string);

  return (
    <AnimatePresence>
      {messageKey &&
        (isMobile ? (
          <motion.p
            key="general-mobile"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-[24px] font-MachineStd text-primary-50 whitespace-nowrap w-full text-center mt-3"
          >
            {displayText}
          </motion.p>
        ) : (
          <motion.div
            key="general-desktop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative inline-block"
            style={{ width: 62, height: 62 }}
          >
            <Image
              src="/images/general.png"
              alt="General Choco"
              width={62}
              height={62}
              className="rounded-full border border-white"
            />

            <div className="absolute bottom-3/4 left-full ml-2 transform flex items-end">
              <div className="w-4 h-4 rounded-full bg-primary-50" />
              <p className="w-fit bg-primary-50 px-6 pt-3 pb-1 rounded-full text-2xl text-primary-300 font-MachineStd whitespace-nowrap">
                {displayText}
              </p>
            </div>
          </motion.div>
        ))}
    </AnimatePresence>
  );
}
