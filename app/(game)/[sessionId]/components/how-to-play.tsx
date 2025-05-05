import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { KPBackdrop, KPClickAnimation } from "@/components";
import { QuestionIcon, InfoCircleIcon } from "@/public/icons";
import { useScreenDetect } from "@/hooks/useScreenDetect";

const DROPDOWN_ANIMATION = {
  initial: { opacity: 0, y: -10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.2 },
};

const HowToPlay: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isXSmall, isSmall, isMedium } = useScreenDetect();
  const isMobile = isXSmall || isSmall || isMedium;

  const toggleOpen = () => setIsOpen((prev) => !prev);
  const close = () => setIsOpen(false);

  return (
    <div className="relative inline-block">
      <KPClickAnimation
        className="bg-primary-750 border border-primary-800 rounded-full flex items-center justify-center size-8 lg:size-9 xl:size-11"
        onClick={toggleOpen}
      >
        {isMobile ? <InfoCircleIcon /> : <QuestionIcon />}
      </KPClickAnimation>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop to catch outside clicks */}
            <KPBackdrop onClick={close} />

            {/* Dropdown panel */}
            <motion.div
              key="how-to-play-dropdown"
              initial={DROPDOWN_ANIMATION.initial}
              animate={DROPDOWN_ANIMATION.animate}
              exit={DROPDOWN_ANIMATION.exit}
              transition={DROPDOWN_ANIMATION.transition}
              className="absolute top-full lg:-top-[15%] mt-2 left-0 lg:left-[130%] z-20 w-[80vw] lg:w-[20vw] bg-primary-250 border border-primary-850 rounded-xl"
            >
              <header className="p-4 border-b border-primary-850">
                <h3 className="text-[20px] leading-none font-medium">
                  How to Play
                </h3>
              </header>

              <div className="p-4 flex flex-col gap-10">
                <ol className="list-decimal list-outside pl-4 space-y-3 text-base leading-relaxed h-fit lg:h-96">
                  <li>Place your fleet by dragging ships onto the grid.</li>
                  <li>Click a ship to rotate its orientation.</li>
                  <li>
                    Once ready, switch to Game mode to start firing shots.
                  </li>
                  <li>
                    Click on a cell to fire; green fires indicate hits, white
                    circles are misses.
                  </li>
                  <li>Sunk ships will disintegrate over time.</li>
                  <li>The first to sink all opponent ships wins!</li>
                </ol>

                <div
                  className="px-6 min-h-[52px] rounded-[4px] bg-primary-250 border-primary-350 border flex flex-col items-center justify-center gap-2.5 transition-all duration-500 cursor-pointer hover:rounded-xl hover:shadow-[0px_4px_0px_0px_#5D656E]"
                  style={{
                    boxShadow: `inset 0px 4px 0px 0px #5D656E`,
                  }}
                  onClick={close}
                >
                  <h2 className="text-[20px] font-MachineStd leading-none text-white">
                    close
                  </h2>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HowToPlay;
