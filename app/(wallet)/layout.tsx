"use client";
import { motion } from "framer-motion";
import { KPHeader } from "@/components";
import useScreenDimension from "@/hooks/useScreenDimension";

export default function WalletLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
}
