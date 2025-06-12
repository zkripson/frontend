import classNames from "classnames";

import { useAudio } from "@/providers/AudioProvider";

const KPGameTypeCard = ({
  name,
  description,
  action,
  className,
  status,
}: IKPGameTypeCard) => {
  const { play } = useAudio();

  const onClick = () => {
    play("place");
    action?.();
  };

  const cardShadow = `inset 0px 4px 0px 0px #5D656E`;

  return (
    <div
      onClick={onClick}
      role={action && "button"}
      className={`relative w-full h-[95px] max-sm:h-16 ${className} hover:rounded-xl`}
    >
      <div
        className={classNames(
          `w-full h-full px-6 max-sm:px-3 border border-primary-350 rounded-[4px] bg-primary-250 flex flex-col items-center justify-center gap-2.5 transition-all duration-500`,
          {
            "opacity-50 pointer-events-none": status === "coming soon",
            "cursor-pointer hover:rounded-xl hover:shadow-[0px_4px_0px_0px_#5D656E]":
              action,
          }
        )}
        style={{
          boxShadow: cardShadow,
        }}
      >
        <h2 className="text-[20px] max-sm:text-[16px] font-medium leading-none text-white">
          {name}
        </h2>
        <p className="text-[16px] max-sm:text-[13px] leading-none text-white/80">
          {description}
        </p>
      </div>

      {status === "coming soon" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-material px-4 py-1.5 border border-primary-600 rounded-full text-primary-600 text-[12px] leading-none">
            Coming Soon
          </div>
        </div>
      )}
    </div>
  );
};

export default KPGameTypeCard;
