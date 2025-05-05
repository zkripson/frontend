import React from "react";

import { useScreenDetect } from "@/hooks/useScreenDetect";
import { CloseIcon, PauseIcon, HamIcon } from "@/public/icons";
import KPClickAnimation from "../click-animation";

const iconSizes = {
  default: { width: 28, height: 26 },
  medium: { width: 24, height: 23 },
  small: { width: 22, height: 20 },
};

const icons = ({ width, height }: { width: number; height: number }) => ({
  close: <CloseIcon width={width} height={height} />,
  pause: <PauseIcon width={width} height={height} />,
  ham: <HamIcon width={width} height={height} />,
});

interface KPIconButtonProps {
  icon: keyof ReturnType<typeof icons>;
  onClick: () => void;
  className?: string;
  variant?: keyof typeof iconSizes;
}

const KPIconButton: React.FC<KPIconButtonProps> = ({
  icon,
  onClick,
  className,
  variant = "default",
}) => {
  const { isXSmall, isSmall, isMedium } = useScreenDetect();
  const responsiveKey: keyof typeof iconSizes = isXSmall
    ? "small"
    : isSmall || isMedium
    ? "medium"
    : "default";

  const size = iconSizes[responsiveKey];

  return (
    <KPClickAnimation
      className={className}
      onClick={onClick}
      title={icon.charAt(0).toUpperCase() + icon.slice(1)}
    >
      <div
        onClick={onClick}
        className="bg-iconButton bg-contain bg-no-repeat size-12 lg:size-14 xl:size-16 flex items-center justify-center"
      >
        {icons(size)[icon]}
      </div>
    </KPClickAnimation>
  );
};

export default KPIconButton;
