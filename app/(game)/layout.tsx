"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export default function GameSessionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const [windowWidth, setWindowWidth] = useState(1920);
  const [windowHeight, setWindowHeight] = useState(1080);

  const springConfig = { damping: 30, stiffness: 150 };

  const moveX = useSpring(
    useTransform(mouseX, [0, windowWidth], ["1.75%", "-1.75%"]),
    springConfig
  );
  const moveY = useSpring(
    useTransform(mouseY, [0, windowHeight], ["1.75%", "-1.75%"]),
    springConfig
  );

  useEffect(() => {
    const updateWindowSize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };

    updateWindowSize();

    window.addEventListener("resize", updateWindowSize);
    return () => window.removeEventListener("resize", updateWindowSize);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

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
