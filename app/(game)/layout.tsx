"use client";
import { motion } from "framer-motion";

import useScreenDimension from "@/hooks/useScreenDimension";

export default function GameSessionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { moveX, moveY } = useScreenDimension();

  return (
    <main className="relative min-h-dvh overflow-hidden">
      <motion.div
        className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-gameBackground bg-[length:100%_100%] bg-center bg-no-repeat"
        style={{
          translateX: moveX,
          translateY: moveY,
        }}
      />

      <div className="relative z-10 flex flex-col min-h-dvh">{children}</div>
    </main>
  );
}
