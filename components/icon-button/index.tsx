import KPClickAnimation from "../click-animation";

import { CloseIcon, PauseIcon, HamIcon } from "@/public/icons";

const icons = ({ width, height }: { width: number; height: number }) => ({
  close: <CloseIcon width={width} height={height} />,
  pause: <PauseIcon width={width} height={height} />,
  ham: <HamIcon width={width} height={height} />,
});

const iconSizes = {
  default: {
    width: 28,
    height: 26,
  },
  medium: {
    width: 22,
    height: 20,
  },
  small: {
    width: 18,
    height: 16,
  },
};

const KPIconButton = ({
  icon,
  onClick,
  className,
  variant = "default",
}: IKPIconButton) => {
  return (
    <KPClickAnimation
      className={className}
      onClick={onClick}
      title={icon.charAt(0).toUpperCase() + icon.slice(1)}
    >
      <div
        onClick={onClick}
        className="bg-iconButton bg-contain bg-no-repeat size-16 flex items-center justify-center"
      >
        {icons(iconSizes[variant])[icon]}
      </div>
    </KPClickAnimation>
  );
};

export default KPIconButton;
