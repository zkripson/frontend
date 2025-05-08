"use client";
import classNames from "classnames";
import { AnimatePresence, motion } from "framer-motion";

import useSystemFunctions from "@/hooks/useSystemFunctions";
import useAppActions from "@/store/app/actions";
import { ExclaimIcon } from "@/public/icons";

const iconColor = {
  error: "#FC0000",
  success: "#00DF16",
  info: "#3498db",
  warning: "#FFC107",
};

const shadowStyle = {
  error: "0px 4px 12px rgba(252, 0, 0, 0.4)",
  success: "0px 4px 12px rgba(0, 223, 22, 0.4)",
  info: "0px 4px 12px rgba(52, 152, 219, 0.4)",
  warning: "0px 4px 12px rgba(255, 193, 7, 0.4)",
};

const KPToastNotification = () => {
  const { appState } = useSystemFunctions();
  const { hideToast } = useAppActions();

  const show = appState.toast.show;
  const type = appState.toast.type;
  const message = appState.toast.message;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: "-100%", scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{
            opacity: 0,
            y: "-100%",
            scale: 0.5,
            transition: { duration: 0.5 },
          }}
          className="w-screen flex justify-center items-center fixed z-[99999] top-[12%] left-0"
        >
          <motion.div
            className={classNames(
              "px-3 py-[10px] rounded-[30px] flex items-center gap-[13px] text-[11px] bg-material",
              {
                "max-w-[375px]": type !== "warning", // Default max-width for other types
                "max-w-fit": type === "warning", // For warning, make it fit content
              }
            )}
            style={{
              boxShadow: shadowStyle[type], // Apply the dynamic shadow based on type
            }}
            onClick={hideToast}
          >
            <div className="w-[20px] h-[20px] flex justify-center items-center">
              <ExclaimIcon fill={iconColor[type]} />
            </div>
            <p className="capitalize text-[13px] text-primary-300 font-medium">
              {message}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default KPToastNotification;
