"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import KPIconButton from "../icon-button";

const STORAGE_KEY = "kpGameRuleLastShown";
const TWO_WEEKS_MS = 1000 * 60 * 60 * 24 * 14;

const KPGameRuleModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const last = localStorage.getItem(STORAGE_KEY);
    const now = Date.now();

    if (!last || now - parseInt(last, 10) > TWO_WEEKS_MS) {
      setIsOpen(true);
      localStorage.setItem(STORAGE_KEY, now.toString());
    }
  }, []);

  return (
    <>
      <span
        onClick={() => setIsOpen(true)}
        className="cursor-pointer text-[clamp(12px,5vw,14px)] text-primary-300 underline font-semibold"
      >
        Game rules
      </span>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              className="relative bg-material rounded-lg shadow-xl w-[90vw] max-w-2xl h-[80vh] overflow-hidden"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-2 right-2 z-10">
                <KPIconButton
                  icon="close"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close rules"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default KPGameRuleModal;
