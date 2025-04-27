"use client";
import { motion, AnimatePresence } from "framer-motion";

const KPFullscreenLoader = ({
  title,
  loadingMessages,
}: IKPFullscreenLoader) => {
  return (
    <div
      id="fullscreen-loader"
      className="fixed inset-0 z-[9999] bg-loadingBackground bg-cover bg-center p-6"
    >
      <div className="size-full relative flex flex-col items-center justify-center gap-8">
        {/* Progress Bar */}
        <div className="relative w-full max-w-[357px] h-[60px] bg-primary-450 border border-primary-300 px-3.5 py-2.5 overflow-hidden">
          <motion.div
            className="h-full bg-primary-200 border border-primary-300"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{
              duration: 10,
              ease: "easeInOut",
            }}
          />
        </div>

        {/* Title */}
        <h1 className="text-[26px] leading-none text-center text-primary-50 font-MachineStd">
          {title}
        </h1>

        {loadingMessages && loadingMessages.length > 0 && (
          <div className="w-full max-w-md flex flex-col items-center justify-end overflow-hidden mt-4 absolute bottom-[8%] left-1/2 transform -translate-x-1/2 h-[120px]">
            <AnimatePresence mode="popLayout" initial={false}>
              {loadingMessages.map((message, index) => {
                const isLastMessage = index === loadingMessages.length - 1;
                const shouldApplyGradient =
                  loadingMessages.length >= 5 && isLastMessage;

                return (
                  <motion.p
                    key={message + index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 0.6,
                      ease: "easeOut",
                    }}
                    className={`text-sm md:text-base text-center ${
                      shouldApplyGradient
                        ? "bg-gradient-to-b from-[#FCD8A5] to-[#342D24] bg-clip-text text-transparent"
                        : "text-primary-50"
                    }`}
                  >
                    {message}
                  </motion.p>
                );
              })}
            </AnimatePresence>

            {/* Optional: nice fading mask at bottom */}
            <div className="absolute bottom-0 left-0 w-full h-6 bg-gradient-to-t from-loadingBackground to-transparent pointer-events-none" />
          </div>
        )}
      </div>
    </div>
  );
};

export default KPFullscreenLoader;
