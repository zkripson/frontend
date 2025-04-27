import classNames from "classnames";
import { a } from "framer-motion/client";

const KPGameTypeCard = ({
  name,
  description,
  action,
  className,
  status,
}: IKPGameTypeCard) => {
  const cardShadow = `inset 0px 4px 0px 0px #5D656E`;

  return (
    <div
      onClick={action}
      role={action && "button"}
      className="relative w-full h-[95px]"
    >
      <div
        className={classNames(
          `w-full h-full px-6 border border-primary-350 rounded-[4px] bg-primary-250 flex flex-col items-center justify-center gap-2.5 transition-all duration-500 ${className}`,
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
        <h2 className="text-[20px] font-medium leading-none text-white">
          {name}
        </h2>
        <p className="text-[16px] leading-none text-white/80">{description}</p>
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
