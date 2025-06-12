"use client";
import { useState, JSX } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SelectGameScreen from "./indexComponents/selectGameScreen";
import StakeScreen from "./indexComponents/StakeScreen";
import ShareInviteScreen from "./indexComponents/shareInviteScreen";
import Wrapper from "./indexComponents/wrapper";
import { KPDialougue, KPGameTypeCard } from "@/components";
import AI from "./indexComponents/AI";

export default function HomePage() {
  // New state for mode selection
  const [mode, setMode] = useState<"select" | "ai" | "friends">("select");
  const [phase, setPhase] = useState<"select" | "stake" | "create">("select");

  const modeOptions = [
    {
      id: "ai",
      name: "Play vs AI",
      description: "Battle against the computer.",
      action: () => setMode("ai"),
    },
    {
      id: "friends",
      name: "Play vs Friends",
      description: "Invite or join a friend to play.",
      action: () => setMode("friends"),
    },
  ];

  const modeScreen = (
    <KPDialougue title="Game Mode">
      <div className="flex flex-col gap-4 w-full">
        {modeOptions.map((option) => (
          <KPGameTypeCard
            key={option.id}
            name={option.name}
            description={option.description}
            action={option.action}
          />
        ))}
      </div>
    </KPDialougue>
  );

  // Friends flow (your current flow, renamed)
  const friendsScreens: Partial<
    Record<"select" | "stake" | "create", JSX.Element>
  > = {
    select: (
      <SelectGameScreen
        nextScreen={() => setPhase("stake")}
        phase={phase}
        onBack={() => setMode("select")}
      />
    ),
    stake: (
      <StakeScreen
        onBack={() => setPhase("select")}
        nextScreen={() => setPhase("create")}
      />
    ),
    create: <ShareInviteScreen onBack={() => setPhase("select")} />,
  };

  // AI flow (replace with your actual AI screens)
  const aiScreens: Partial<Record<"select" | "stake" | "create", JSX.Element>> =
    {
      select: <AI onBack={() => setMode("select")} />,
    };

  let content: JSX.Element;
  if (mode === "select") {
    content = modeScreen;
  } else if (mode === "friends") {
    content = friendsScreens[phase]!;
  } else {
    content = aiScreens[phase]!;
  }

  return (
    <Wrapper>
      <div className="w-full h-full flex items-center justify-center relative">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={mode + phase}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute w-full h-full flex items-center justify-center"
          >
            {content}
          </motion.div>
        </AnimatePresence>
      </div>
    </Wrapper>
  );
}
