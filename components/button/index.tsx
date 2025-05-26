"use client";

import classNames from "classnames";
import { motion } from "framer-motion";
import Image from "next/image";

import { ArrowRightIcon, CopyIcon, RedoIcon, Homeicon } from "@/public/icons";
import { useAudio } from "@/providers/AudioProvider";
import KPLoader from "../loader";

const icons = {
  farcaster: (
    <Image
      src="/images/farcaster.webp"
      alt="farcaster"
      width={32}
      height={32}
      quality={80}
      className="size-8 max-sm:size-[21.39px] object-cover rounded-md"
    />
  ),
  x: (
    <Image
      src="/images/x.webp"
      alt="farcaster"
      width={32}
      height={32}
      quality={80}
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
  multipleicons,
  hide,
  small,
}: IKPButton) => {
  const audio = useAudio();

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
        `flex justify-center items-center border rounded-[4px] relative transition-opacity duration-500`,
        className,
        {
          "w-full": fullWidth,
          "bg-primary-200 border-primary-300": variant === "primary",
          "bg-primary-250 border-primary-350": variant === "secondary",
          "bg-primary-150 border-primary-400": variant === "tertiary",
          "h-[52px] max-sm:h-[34.76px]": isMachine && !small,
          "h-[38px]": isMachine && small,
          "opacity-0 pointer-events-none": hide,
          "opacity-50 pointer-events-none": disabled,
        }
      )}
      disabled={disabled || loading}
      type={type}
      onClick={() => {
        audio.play("place");
        if (onClick) onClick();
      }}
      style={{
        boxShadow: innerShadow,
      }}
    >
      {loading && (
        <div className="top-0 left-0 w-full h-full flex items-center justify-center">
          <KPLoader />
        </div>
      )}

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

          {multipleicons && (
            <div className="flex items-center gap-2">
              {multipleicons.map((icon) => (
                <span
                  key={icon}
                  className={classNames("flex-shrink-0", {
                    "mb-1.5": icon !== "x",
                  })}
                >
                  {icons[icon]}
                </span>
              ))}
            </div>
          )}
          <span
            className={classNames("uppercase", {
              "text-white": variant === "primary" || variant === "secondary",
              "text-primary-300": variant === "tertiary",
              "font-MachineStd": isMachine,
              "font-Inter": !isMachine,
              "text-[26px] max-sm:text-[17.83px] leading-[100%] tracking-[2%]":
                !small,
              "text-[20px] leading-[100%] -mt-1": small,
            })}
          >
            {title}
          </span>
        </div>
      )}
    </motion.button>
  );
};

export default KPButton;
