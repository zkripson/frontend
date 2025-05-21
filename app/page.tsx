"use client";
import { useState, JSX } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { KPHeader } from "@/components";
import useScreenDimension from "@/hooks/useScreenDimension";
import SelectGameScreen from "./indexComponents/selectGameScreen";
import StakeScreen from "./indexComponents/StakeScreen";
import ShareInviteScreen from "./indexComponents/shareInviteScreen";
import { usePrivy } from "@privy-io/react-auth";

export default function HomePage() {
  const { user } = usePrivy();
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
    <Container>
      {!user ? (
        <div></div>
      ) : (
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
      )}
    </Container>
  );
}

const Container = ({ children }: { children: React.ReactNode }) => {
  const { moveX, moveY } = useScreenDimension();

  return (
    <main className="relative w-screen h-screen overflow-hidden">
      <motion.div
        className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-primaryBackground bg-cover bg-center bg-no-repeat max"
        style={{
          translateX: moveX,
          translateY: moveY,
        }}
      />
      <KPHeader />

      <div className="relative z-10 w-full h-full flex items-center justify-center overflow-visible">
        <div className="w-full h-full flex items-center justify-center pt-[5%] transition-transform duration-300 ease-in-out">
          {children}
        </div>
      </div>
    </main>
  );
};
