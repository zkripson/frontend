"use client";
import { motion, AnimatePresence } from "framer-motion";
import classNames from "classnames";

import { CheckIcon } from "@/public/icons";

const KPCheckbox = ({
  checked,
  onChange,
  disabled = false,
  className,
  label,
}: IKPCheckbox) => {
  return (
    <div
      className={classNames(`${className}`, {
        "flex items-center gap-2 cursor-pointer": label,
      })}
      onClick={() => !disabled && onChange(!checked)}
    >
      <div
        className="relative size-6 max-sm:size-4 bg-primary-450 border border-primary-600 rounded-sm cursor-pointer"
        style={{
          boxShadow: "inset 0px 2.5px 0px 0px #8C5A0B40",
        }}
      >
        <AnimatePresence>
          {checked && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-end justify-center pb-0.5 max-sm:pb-[1px]"
            >
              <CheckIcon
                width={16}
                height={16}
                className="size-4 max-sm:size-2.5"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {label && (
        <p className="text-base max-sm:text-[10.69px] text-primary-50">
          {label}
        </p>
      )}
    </div>
  );
};

export default KPCheckbox;
