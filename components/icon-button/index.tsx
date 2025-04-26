import KPClickAnimation from "../click-animation";

import { CloseIcon, PauseIcon, HamIcon } from "@/public/icons";

const icons = {
  close: <CloseIcon />,
  pause: <PauseIcon />,
  ham: <HamIcon />,
};

const KPIconButton = ({ icon, onClick, className }: IKPIconButton) => {
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
        {icons[icon]}
      </div>
    </KPClickAnimation>
  );
};

export default KPIconButton;
