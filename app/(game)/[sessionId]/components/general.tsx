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
  sunk: {
    default: "GREAT! YOU SUNK THEIR SHIP",
    Carrier: "YOU SUNK THE CARRIER!",
    Battleship: "YOU SUNK THE BATTLESHIP!",
    Cruiser: "YOU SUNK THE CRUISER!",
    Submarine: "YOU SUNK THE SUBMARINE!",
    Destroyer: "YOU SUNK THE DESTROYER!",
  },
  "opponent-sunk": {
    default: "OPPONENT SUNK YOUR SHIP",
    Carrier: "THEY SUNK YOUR CARRIER!",
    Battleship: "THEY SUNK YOUR BATTLESHIP!",
    Cruiser: "THEY SUNK YOUR CRUISER!",
    Submarine: "THEY SUNK YOUR SUBMARINE!",
    Destroyer: "THEY SUNK YOUR DESTROYER!",
  },
  "opponent-hit": "OPPONENT HIT YOUR SHIP",
  "player-missed": "YOU MISSED!",
} as const;

export type GeneralMessageKey = keyof typeof messages;

// Helper to resolve message and voiceover key
function resolveMessageAndVoiceover(
  messageKey: GeneralMessageKey | null,
  shipName?: string
): { text: string; voiceoverKey?: string } {
  if (!messageKey) return { text: "", voiceoverKey: undefined };
  const msg = messages[messageKey];
  if (
    (messageKey === "sunk" || messageKey === "opponent-sunk") &&
    typeof msg === "object" &&
    msg !== null &&
    "default" in msg
  ) {
    const text = (shipName && msg[shipName as keyof typeof msg]) || msg.default;
    // Only allow known voiceover keys
    const allowedVoiceovers = [
      "sunk_voiceover",
      "sunk_carrier_voiceover",
      "sunk_battleship_voiceover",
      "sunk_cruiser_voiceover",
      "sunk_submarine_voiceover",
      "sunk_destroyer_voiceover",
      "opponent_sunk_voiceover",
      "opponent_sunk_carrier_voiceover",
      "opponent_sunk_battleship_voiceover",
      "opponent_sunk_cruiser_voiceover",
      "opponent_sunk_submarine_voiceover",
      "opponent_sunk_destroyer_voiceover",
    ] as const;
    let voiceoverKey: string | undefined = undefined;
    if (shipName) {
      const key =
        messageKey === "sunk"
          ? `sunk_${shipName.toLowerCase()}_voiceover`
          : `opponent_sunk_${shipName.toLowerCase()}_voiceover`;
      if (allowedVoiceovers.includes(key as any)) voiceoverKey = key;
    }
    if (!voiceoverKey) {
      voiceoverKey =
        messageKey === "sunk" ? "sunk_voiceover" : "opponent_sunk_voiceover";
    }
    return { text, voiceoverKey };
  }
  if (Array.isArray(msg)) {
    return { text: msg[0], voiceoverKey: messageKey + "_voiceover" };
  }
  return { text: msg as string, voiceoverKey: messageKey + "_voiceover" };
}

interface GeneralProps {
  messageKey: GeneralMessageKey | null;
  uniqueId?: number;
  shipName?: string;
}

export default function General({
  messageKey,
  uniqueId,
  shipName,
}: GeneralProps) {
  // pull in your mobile-detect flags
  const { isXSmall, isSmall } = useScreenDetect();
  const isMobile = isXSmall || isSmall;

  // figure out which string to display
  const { text: displayText, voiceoverKey } = resolveMessageAndVoiceover(
    messageKey,
    shipName
  );
  const isArray = Array.isArray(displayText);
  const [hitIndex, setHitIndex] = useState(0);
  const prevKey = useRef<GeneralMessageKey>(messageKey);
  const audio = useAudio();
  const playedRef = useRef<{
    key: GeneralMessageKey | null;
    uniqueId?: number;
  }>({ key: null, uniqueId: undefined });
  const [showBubble, setShowBubble] = useState(false);

  const msgLength =
    displayText && Array.isArray(displayText) ? displayText.length : 0;
  useEffect(() => {
    if (!messageKey) return;
    if (
      messageKey === "hit" &&
      prevKey.current === "hit" &&
      displayText &&
      Array.isArray(displayText)
    ) {
      setHitIndex((i) => (i + 1) % displayText.length);
    }
    prevKey.current = messageKey;
  }, [messageKey, displayText, msgLength, uniqueId]);

  useEffect(() => {
    if (!messageKey) return;
    // Only play if messageKey or uniqueId changes and show is true
    if (
      playedRef.current.key !== messageKey ||
      playedRef.current.uniqueId !== uniqueId
    ) {
      // Only play if the key is a valid sound
      const allowedVoiceovers = [
        "sunk_voiceover",
        "sunk_carrier_voiceover",
        "sunk_battleship_voiceover",
        "sunk_cruiser_voiceover",
        "sunk_submarine_voiceover",
        "sunk_destroyer_voiceover",
        "opponent_sunk_voiceover",
        "opponent_sunk_carrier_voiceover",
        "opponent_sunk_battleship_voiceover",
        "opponent_sunk_cruiser_voiceover",
        "opponent_sunk_submarine_voiceover",
        "opponent_sunk_destroyer_voiceover",
        "hit_voiceover",
        "miss_voiceover",
        "game_start_voiceover",
        "another_hit_voiceover",
        "game_over_voiceover",
        "waiting_voiceover",
      ] as const;
      if (
        voiceoverKey &&
        allowedVoiceovers.includes(
          voiceoverKey as (typeof allowedVoiceovers)[number]
        )
      ) {
        audio.play(voiceoverKey as (typeof allowedVoiceovers)[number]);
      }
      playedRef.current = { key: messageKey, uniqueId };
    }
  }, [messageKey, uniqueId, audio, voiceoverKey]);

  useEffect(() => {
    // This effect will run on every uniqueId change, even if messageKey is the same
  }, [uniqueId]);

  // Show bubble on message change, hide after 2s
  useEffect(() => {
    if (!messageKey) return;
    setShowBubble(true);
    const timeout = setTimeout(() => setShowBubble(false), 2000);
    return () => clearTimeout(timeout);
  }, [messageKey, uniqueId]);

  // Show mobile text on message change, hide after 2s
  const [showMobileText, setShowMobileText] = useState(false);
  useEffect(() => {
    if (!messageKey) return;
    setShowMobileText(true);
    const timeout = setTimeout(() => setShowMobileText(false), 2000);
    return () => clearTimeout(timeout);
  }, [messageKey, uniqueId]);

  const displayTextFinal = isArray
    ? displayText[hitIndex]
    : (displayText as string);

  return (
    <AnimatePresence>
      {messageKey &&
        (isMobile ? (
          showMobileText && (
            <motion.p
              key="general-mobile"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[24px] font-MachineStd text-primary-50 whitespace-nowrap w-full text-center mt-3"
            >
              {displayTextFinal}
            </motion.p>
          )
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

            <AnimatePresence>
              {showBubble && (
                <motion.div
                  key="bubble"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0, transition: { duration: 0.18 } }}
                  exit={{ opacity: 0, y: -10, transition: { duration: 0.18 } }}
                  className="absolute bottom-3/4 left-full ml-2 transform flex items-end"
                >
                  <div className="w-4 h-4 rounded-full bg-primary-50" />
                  <p className="w-fit bg-primary-50 px-6 pt-3 pb-1 rounded-full text-2xl text-primary-300 font-MachineStd whitespace-nowrap">
                    {displayTextFinal}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
    </AnimatePresence>
  );
}
