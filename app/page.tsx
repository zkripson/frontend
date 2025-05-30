"use client";
import { useState, JSX } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SelectGameScreen from "./indexComponents/selectGameScreen";
import StakeScreen from "./indexComponents/StakeScreen";
import ShareInviteScreen from "./indexComponents/shareInviteScreen";
import Wrapper from "./indexComponents/wrapper";

export default function HomePage() {
  const [phase, setPhase] = useState<"select" | "stake" | "create">("select");

  const screens: Partial<Record<NewGameStep, JSX.Element>> & {
    stake?: JSX.Element;
  } = {
    select: (
      <SelectGameScreen nextScreen={() => setPhase("stake")} phase={phase} />
    ),
    stake: (
      <StakeScreen
        onBack={() => setPhase("select")}
        nextScreen={() => setPhase("create")}
      />
    ),
    create: <ShareInviteScreen onBack={() => setPhase("select")} />,
  };

  return (
    <Wrapper>
      <div className="w-full h-full flex items-center justify-center relative">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={phase}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute w-full h-full flex items-center justify-center"
          >
            {screens[phase]}
          </motion.div>
        </AnimatePresence>
      </div>
    </Wrapper>
  );
}
