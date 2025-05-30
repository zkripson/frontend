"use client";
import { useEffect, useState } from "react";
import { useMotionValue, useSpring, useTransform } from "framer-motion";

export default function useScreenDimension() {
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

  return { moveX, moveY };
}
