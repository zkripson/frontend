"use client";
import React from "react";
import { motion, Variants } from "framer-motion";

const bounceVariants: Variants = {
  initial: { y: "0%" },
  animate: (i) => ({
    y: ["0%", "-50%", "0%"],
    transition: {
      repeat: Infinity,
      repeatType: "loop",
      duration: 0.6,
      ease: "easeInOut",
      delay: i * 0.5,
    },
  }),
};

export const KPSecondaryLoader: React.FC<{ size?: number }> = ({
  size = 12,
}) => (
  <motion.div className="flex items-end justify-center gap-2">
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className="rounded-full bg-white/85"
        style={{ width: size, height: size }}
        custom={i}
        variants={bounceVariants}
        initial="initial"
        animate="animate"
      />
    ))}
  </motion.div>
);

export default KPSecondaryLoader;
