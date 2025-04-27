"use client";
import { motion } from "framer-motion";

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
        <div className="relative w-full max-w-[357px] h-[60px]  bg-primary-450 border border-primary-300 px-3.5 py-2.5 overflow-hidden">
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

        <h1 className="text-[26px] leading-none text-center text-primary-50 font-MachineStd">
          {title}
        </h1>

        {loadingMessages && loadingMessages.length > 0 && (
          <div className="flex flex-col items-center gap-2 mt-4 w-full max-w-md absolute bottom-[8%] left-1/2 transform -translate-x-1/2">
            {loadingMessages.map((message, index) => {
              const isLastMessage = index === loadingMessages.length - 1;
              const shouldApplyGradient =
                loadingMessages.length >= 5 && isLastMessage;

              return (
                <motion.p
                  key={message + index}
                  className={`text-sm md:text-base text-center ${
                    shouldApplyGradient
                      ? "bg-gradient-to-b from-[#FCD8A5] to-[#342D24] bg-clip-text text-transparent"
                      : "text-primary-50"
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 2 }}
                >
                  {message}
                </motion.p>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default KPFullscreenLoader;
