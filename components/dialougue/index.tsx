"use client";
import Image from "next/image";
import classNames from "classnames";

import { BackIcon, CheckIcon } from "@/public/icons";
import KPIconButton from "../icon-button";
import KPClickAnimation from "../click-animation";
import KPButton from "../button";
import Points from "./points";

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
  showPoints,
}: KPDialougueProps) => {
  return (
    <div
      className={classNames(
        `relative 
        w-[588px] h-[824.41px]
        max-sm:w-[390px] max-sm:h-[551px]
        bg-dialougue bg-cover bg-no-repeat bg-center
        flex flex-col items-center text-center px-6
        transition-transform duration-300 ease-in-out
        sm:scale-[0.75] md:scale-[0.8] lg:scale-[0.85] min-[1281px]:scale-[0.90] min-[1526px]:scale-100
        
        /* Custom: below 390px width */
        [@media(max-width:389px)]:w-[320px] [@media(max-width:389px)]:h-[450px] [@media(max-width:389px)]:px-3.5
        [@media(max-width:389px)]:pt-10 [@media(max-width:389px)]:pb-4
        [@media(max-width:389px)]:text-[13px]
        `,
        {
          "pt-16 max-sm:pt-12": showKripsonImage,
          "pt-32 max-sm:pt-16": !showKripsonImage,
        },
        className
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
          className="w-[426px] h-[212px] max-sm:w-[285px] max-sm:h-[142px] [@media(max-width:389px)]:w-[85%] rounded-lg mb-9 max-sm:mb-5"
          quality={80}
          priority
        />
      )}

      <div className="px-14 max-sm:px-6 w-full">
        <div className="flex flex-col text-center gap-10 max-sm:gap-4 w-full max-w-[426px] max-sm:max-w-[285px]">
          <div className="flex flex-col items-center gap-1 max-sm:gap-1.5">
            <h2
              className="text-[62px] max-sm:text-[41px] max-sm:-mb-2 leading-[100%] font-bold text-primary-50 uppercase font-MachineStd max-sm:tracking-[0%]
              [@media(max-width:389px)]:text-[28px] [@media(max-width:389px)]:-mb-1
            "
            >
              {title}
            </h2>

            {subtitle && (
              <p
                className="text-base max-sm:text-[10.69px] max-sm:leading-[120%] text-primary-50
                [@media(max-width:389px)]:text-[9px] [@media(max-width:389px)]:leading-[110%]"
              >
                {subtitle}
              </p>
            )}
          </div>

          {children}
          {showPoints && <Points />}
        </div>
      </div>

      <div className="absolute bottom-[38px] w-full px-16 max-sm:bottom-[28px] max-sm:px-10 [@media(max-width:389px)]:bottom-[18px] [@media(max-width:389px)]:px-[34px]">
        <div
          className={classNames("flex items-stretch w-full", {
            "gap-2 flex-row-reverse": primaryCta && secondaryCta,
          })}
        >
          {primaryCta && <KPButton isMachine fullWidth {...primaryCta} />}
          {secondaryCta && <KPButton isMachine fullWidth {...secondaryCta} />}

          {ctaText && (
            <div className="w-full flex items-center justify-center gap-2 h-[52px] max-sm:h-[34.76px] [@media(max-width:389px)]:h-[24px]">
              <CheckIcon className="max-sm:size-[17.38px] [@media(max-width:389px)]:size-[12px]" />
              <p className="text-base max-sm:text-[12.03px] max-sm:leading-none text-primary-50 [@media(max-width:389px)]:text-[8px]">
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
