"use client";
import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

import { KPHeader } from "@/components";

export default function AuthLayout({
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
    useTransform(mouseX, [0, windowWidth], ["1%", "-1%"]),
    springConfig
  );
  const moveY = useSpring(
    useTransform(mouseY, [0, windowHeight], ["1%", "-1%"]),
    springConfig
  );

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    setWindowHeight(window.innerHeight);

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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
        <div className="w-full h-full flex items-center justify-center 2xl:pt-12 lg:pt-10 transition-transform duration-300 ease-in-out">
          {children}
        </div>
      </div>
    </main>
  );
}
