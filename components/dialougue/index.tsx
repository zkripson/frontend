"use client";
import Image from "next/image";
import classNames from "classnames";

import { BackIcon, CheckIcon } from "@/public/icons";
import KPIconButton from "../icon-button";
import KPClickAnimation from "../click-animation";
import KPButton from "../button";

const KPDialougue = ({
  children,
  title,
  onBack,
  onClose,
  primaryCta,
  secondaryCta,
  showBackButton = false,
  showCloseButton = false,
  showKripsonImage = false,
  subtitle,
  ctaText,
  className,
}: KPDialougueProps) => {
  return (
    <div
      className={classNames(
        `relative 
        w-[588px] h-[824.41px]
        max-sm:w-[390px] max-sm:h-[551px]
        bg-dialougue bg-cover bg-no-repeat bg-center
        flex flex-col items-center text-center px-6 ${className}`,
        {
          "pt-16 max-sm:pt-12": showKripsonImage,
          "pt-32 max-sm:pt-16": !showKripsonImage,
        }
      )}
    >
      {showCloseButton && onClose && (
        <KPIconButton
          icon="close"
          onClick={onClose}
          className="absolute top-[5.5%] right-[10.5%]"
        />
      )}

      {showBackButton && onBack && (
        <KPClickAnimation
          onClick={onBack}
          className="absolute top-[8.2%] left-[13.5%]"
        >
          <BackIcon />
        </KPClickAnimation>
      )}

      {showKripsonImage && (
        <Image
          src="/images/kripson.jpeg"
          alt="Kripson"
          width={500}
          height={500}
          className="w-[426px] h-[212px] max-sm:w-[285px] max-sm:h-[142px] rounded-lg mb-9 max-sm:mb-5"
          quality={100}
        />
      )}

      <div className="px-14 max-sm:px-6 w-full">
        <div className="flex flex-col items-center text-center gap-10 max-sm:gap-4 w-full max-w-[426px] max-sm:max-w-[285px]">
          <div className="flex flex-col items-center gap-1 max-sm:gap-1.5">
            <h2 className="text-[62px] max-sm:text-[41px] max-sm:-mb-2 leading-[100%] font-bold text-primary-50 uppercase font-MachineStd max-sm:tracking-[0%]">
              {title}
            </h2>

            {subtitle && (
              <p className="text-base max-sm:text-[10.69px] max-sm:leading-[120%] text-primary-50">
                {subtitle}
              </p>
            )}
          </div>

          {children}
        </div>
      </div>

      <div className="absolute bottom-[38px] w-full px-16 max-sm:bottom-[28px] max-sm:px-10">
        <div
          className={classNames("flex items-stretch w-full", {
            "gap-2": primaryCta && secondaryCta,
          })}
        >
          {primaryCta && <KPButton isMachine fullWidth {...primaryCta} />}
          {secondaryCta && (
            <button
              onClick={secondaryCta.onClick}
              className="bg-transparent border border-white text-white py-3 rounded-md font-semibold"
            >
              {secondaryCta.title}
            </button>
          )}

          {ctaText && (
            <div className="w-full flex items-center justify-center gap-2 h-[52px] max-sm:h-[34.76px]">
              <CheckIcon className="max-sm:size-[17.38px]" />
              <p className="text-base max-sm:text-[12.03px] max-sm:leading-none text-primary-50">
                {ctaText}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KPDialougue;
