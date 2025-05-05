"use client";

import classNames from "classnames";
import { motion } from "framer-motion";
import Image from "next/image";

import { ArrowRightIcon, CopyIcon, RedoIcon, Homeicon } from "@/public/icons";
import KPLoader from "../loader";

const icons = {
  farcaster: (
    <Image
      src="/images/farcaster.png"
      alt="farcaster"
      width={32}
      height={32}
      quality={100}
      className="size-8 max-sm:size-[21.39px] object-cover rounded-md"
    />
  ),
  x: (
    <Image
      src="/images/x.png"
      alt="farcaster"
      width={32}
      height={32}
      quality={100}
      className="size-7 max-sm:size-[17.38px] object-cover rounded-md -mt-2"
    />
  ),
  copy: <CopyIcon />,
  arrow: <ArrowRightIcon className="max-sm:size-6" />,
  home: <Homeicon />,
  replay: <RedoIcon />,
};

const KPButton = ({
  title,
  className,
  disabled,
  fullWidth = false,
  loading,
  onClick,
  type = "button",
  variant = "primary",
  isMachine = false,
  icon,
  iconPosition = "left",
}: IKPButton) => {
  const shadowColor = {
    primary: "#632918",
    secondary: "#5D656E",
    tertiary: "#F4F5F6",
  }[variant];

  const innerShadow = `inset 0px 4px 0px 0px ${shadowColor}`;

  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.95 }}
      className={classNames(
        `flex justify-center items-center border rounded-[4px]`,
        {
          "w-full": fullWidth,
          "bg-primary-200 border-primary-300": variant === "primary",
          "bg-primary-250 border-primary-350": variant === "secondary",
          "bg-primary-150 border-primary-400": variant === "tertiary",
          "h-[52px] max-sm:h-[34.76px]": isMachine,
        },
        className
      )}
      disabled={disabled || loading}
      type={type}
      onClick={onClick}
      style={{
        boxShadow: innerShadow,
      }}
    >
      {loading && <KPLoader variant="small" />}

      {!loading && (
        <div
          className={classNames("flex justify-center gap-2.5", {
            "flex-row": iconPosition === "left",
            "flex-row-reverse": iconPosition === "right",
            "items-end mt-1.5": icon === "farcaster",
            "items-center mt-3": icon !== "farcaster",
          })}
        >
          {icon && (
            <span
              className={classNames("flex-shrink-0", {
                "mb-1.5":
                  icon === "arrow" || icon === "home" || icon === "replay",
              })}
            >
              {icons[icon]}
            </span>
          )}

          <span
            className={classNames(
              "uppercase text-[26px] max-sm:text-[17.83px] leading-[100%] tracking-[2%]",
              {
                "text-white": variant === "primary" || variant === "secondary",
                "text-primary-300": variant === "tertiary",
                "font-MachineStd": isMachine,
                "font-Inter": !isMachine,
              }
            )}
          >
            {title}
          </span>
        </div>
      )}
    </motion.button>
  );
};

export default KPButton;
