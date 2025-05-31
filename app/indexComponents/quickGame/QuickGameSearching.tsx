import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

import { KPLoader } from "@/components";
import { gameTips } from "./quickGameConfig";

const QuickGameSearching = () => {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => {
      setTipIndex((i) => (i + 1) % gameTips.length);
    }, 8000);
    return () => clearInterval(iv);
  }, []);
  return (
    <div className="flex flex-col items-center max-sm:gap-6 gap-10 w-full max-sm:mt-0 mt-20">
      <div className="flex flex-col gap-4 items-center">
        <div className="max-[390px]:scale-125 scale-150 mb-5">
          <KPLoader />
        </div>

        <h1 className="text-[26px] max-sm:text-[20px] leading-none font-MachineStd text-primary-50 uppercase">
          SEARCHING FOR OPPONENT
        </h1>

        <p className="text-[18px] max-sm:text-[14px] leading-none text-primary-50 text-center">
          You’ll get matched with available players in a sec…
        </p>
      </div>

      <div className="max-[390px]:mt-0 max-sm:mt-2 mt-8 w-full bg-primary-50 rounded-xl max-sm:p-2 p-4 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Image
            src="/images/trophy.webp"
            alt="Trophy"
            width={40}
            height={40}
            quality={75}
            className="max-[390px]:size-5 size-10 max-sm:size-7"
          />

          <p className="text-[clamp(13px,5vw,16px)] text-primary-300 uppercase">
            Game Tips:
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.p
            key={tipIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="max-sm:text-[14px] text-[clamp(13px,5vw,16px)] text-primary-300 text-left"
          >
            {gameTips[tipIndex]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default QuickGameSearching;
