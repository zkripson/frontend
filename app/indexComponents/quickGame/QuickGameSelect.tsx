import { AnimatePresence, motion } from "framer-motion";

import { RadioIcon } from "@/public/icons";
import { stakeOptions } from "./quickGameConfig";

const QuickGameSelect = ({
  setStake,
  stake,
}: {
  stake: StakeValue;
  setStake: (stake: StakeValue) => void;
}) => (
  <div className="flex flex-col gap-6 w-full items-center max-[390px]:mt-3">
    <h1 className="text-[26px] max-sm:text-[20px] leading-none text-primary-50 font-MachineStd mb-2">
      ENTER STAKE AMOUNT:
    </h1>

    <div className="flex flex-col gap-4 w-full">
      {stakeOptions.map(({ value, label, description }) => (
        <div
          key={value}
          role="radio"
          aria-checked={stake === value}
          onClick={() => setStake(value)}
          className="flex items-center gap-3 cursor-pointer"
        >
          <div className="w-4 h-4 lg:w-5 lg:h-5 rounded-full border border-primary-450 flex justify-center items-center">
            <AnimatePresence>
              {stake === value && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="hidden lg:block">
                    <RadioIcon />
                  </div>
                  <div className="block lg:hidden">
                    <RadioIcon size={10} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <p className="text-[14px] lg:text-[18px] leading-none text-primary-50">
            {label}
          </p>

          {description && (
            <span className="px-2 py-1 rounded-full text-xs leading-none text-primary-600 bg-material">
              {description}
            </span>
          )}
        </div>
      ))}
    </div>
  </div>
);

export default QuickGameSelect;
