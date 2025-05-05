"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useScreenDetect } from "@/hooks/useScreenDetect";

const messages = {
  "game-start": "game start",
  waiting: "waiting for opponent ⏳",
  missed: "opponent missed!",
  hit: ["you hit!", "another hit!"],
  sunk: "GREAT! YOU SUNK THEIR SHIP",
} as const;

export type GeneralMessageKey = keyof typeof messages;

interface GeneralProps {
  messageKey: GeneralMessageKey;
  show: boolean;
}

export default function General({ messageKey, show }: GeneralProps) {
  // pull in your mobile-detect flags
  const { isXSmall, isSmall } = useScreenDetect();
  const isMobile = isXSmall || isSmall;

  // figure out which string to display
  const msg = messages[messageKey];
  const isArray = Array.isArray(msg);
  const [hitIndex, setHitIndex] = useState(0);
  const prevKey = useRef<GeneralMessageKey>(messageKey);

  useEffect(() => {
    if (messageKey === "hit" && prevKey.current === "hit") {
      setHitIndex((i) => (i + 1) % msg.length);
    }
    prevKey.current = messageKey;
  }, [messageKey, msg.length]);

  const displayText = isArray ? msg[hitIndex] : (msg as string);

  return (
    <AnimatePresence>
      {show &&
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
