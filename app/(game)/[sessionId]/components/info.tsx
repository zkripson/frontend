import classNames from "classnames";
import { AnimatePresence, motion } from "framer-motion";

import { DangerIcon, InfoCircleIcon } from "@/public/icons";

const Info = ({ message, onStopShowing, type, show, warningTitle }: Info) => {
  const icons = {
    info: <InfoCircleIcon width={24} height={24} />,
    warning: <DangerIcon />,
  };
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={classNames(
            "max-w-[282px] lg:max-w-[380px] xl:max-w-[473px]",
            {
              "flex flex-col items-center lg:gap-3": type === "info",
            }
          )}
        >
          <div
            className={classNames(
              "flex gap-2 items-center px-2.5 xl:px-5 py-1.5 xl:py-2.5 rounded-full",
              {
                "bg-primary-750 border border-primary-800": type === "info",
                "bg-primary-900 border border-primary-950": type === "warning",
              }
            )}
          >
            <div className="w-fit h-fit scale-90 xl:scale-100">
              {icons[type]}
            </div>

            <p
              className={classNames(
                "text-[10.73px] lg:text-[15px]  xl:text-[18px] leading-none text-left",
                {
                  "text-primary-800": type === "info",
                  "text-primary-950": type === "warning",
                }
              )}
            >
              {warningTitle && (
                <span className="font-bold">{warningTitle} </span>
              )}{" "}
              {message}
            </p>
          </div>

          {type === "info" && (
            <div
              onClick={onStopShowing}
              className="hidden lg:flex items-center gap-1"
            >
              <div className="bg-transparent border border-white size-4 rounded-sm" />
              <p className="text-[10.73px] lg:text-[15px]  xl:text-[18px] leading-none text-white">
                Stop showing playing instructions.
              </p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Info;
