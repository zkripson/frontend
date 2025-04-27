"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

import {
  KPFullscreenLoader,
  KPGameBadge,
  KPIconButton,
  KPProfileBadge,
  KPTimer,
} from "@/components";

const loadingMessages = [
  "Creating opponent fleet...",
  "Completing fleet coordinates...",
  "Loading battleships and environments...",
  "Initializing smart contract...",
  "Deploying smart contract...",
];

const GameSession = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [loadingDone, setLoadingDone] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex >= loadingMessages.length) {
      const timer = setTimeout(() => {
        setLoadingDone(true);
      }, 2000);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setMessages((prev) => [...prev, loadingMessages[currentIndex]]);
      setCurrentIndex((prev) => prev + 1);
    }, 2000);

    return () => clearTimeout(timer);
  }, [currentIndex]);

  return (
    <div className="relative flex items-center justify-center flex-1">
      <AnimatePresence>
        {!loadingDone && (
          <motion.div
            key="loader"
            className="absolute inset-0 z-[9999]"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <KPFullscreenLoader
              title="loading new game..."
              loadingMessages={messages}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {loadingDone && (
        <motion.div
          key="game"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full h-full flex flex-col items-center justify-center bg-black"
        >
          <div className="fixed top-[5%] left-0 flex items-center justify-between w-full px-12">
            <KPProfileBadge
              username="Choco"
              variant="secondary"
              balance={37.56}
            />

            <div className="flex items-center gap-6">
              <KPTimer initialSeconds={60} />
              <KPIconButton icon="pause" onClick={() => {}} />
              <KPIconButton icon="ham" onClick={() => {}} />
            </div>
          </div>

          <div></div>

          <div className="fixed bottom-[5%] right-0 flex items-center justify-between w-full px-12">
            <KPGameBadge status="ready" username="Choco" isPlayer />

            <KPGameBadge
              status="joining..."
              username="Njoku"
              avatarUrl="/images/kripson.jpeg"
              isPlayer={false}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default GameSession;
