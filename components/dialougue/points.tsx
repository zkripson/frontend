import { ArrowRightAltIcon, StarIcon } from "@/public/icons";
import KPClickAnimation from "../click-animation";
import useSystemFunctions from "@/hooks/useSystemFunctions";
import classNames from "classnames";

const Points = () => {
  const {
    navigate,
    playerState: { playerRewards },
  } = useSystemFunctions();

  const totalPoints = Number(playerRewards?.totalPoints || 0).toLocaleString();
  return (
    <KPClickAnimation
      onClick={() => navigate.push("/rewards")}
      className={classNames(
        "rounded-lg px-4 md:px-5 py-2 flex justify-between items-center bg-primary-50 cursor-pointer mt-12 lg:mt-20 shadow-lg shadow-primary-100/50",
        {
          hidden: !playerRewards,
        }
      )}
    >
      <div className="flex items-center gap-6 lg:gap-8">
        <div className="flex items-center gap-2 lg:gap-3">
          <div className="hidden lg:flex bg-iconButton bg-contain bg-no-repeat size-8 md:size-[39px] items-center justify-center">
            <StarIcon />
          </div>

          <div className="flex lg:hidden bg-iconButton bg-contain bg-no-repeat size-6 items-center justify-center">
            <StarIcon width={12} height={13} />
          </div>

          <div className="flex flex-col justify-start items-start text-primary-300">
            <p className="text-[8px] md:text-xs">Your Ribbons</p>
            <p className="text-[13px] md:text-[18px] font-medium">
              {totalPoints}
            </p>
          </div>
        </div>

        {/* <div className="rounded-[50px] px-3 h-6 lg:h-7 flex items-center justify-center gap-2 border border-primary-300">
          <div className="hidden lg:block">
            <StarIcon fill="#44190C" width={14} height={14} />
          </div>

          <div className="block lg:hidden">
            <StarIcon fill="#44190C" width={11} height={11} />
          </div>

          <p className="text-primary-300 font-medium text-[10px] lg:text-[13px]">
            Level 1
          </p>
        </div> */}
      </div>

      <ArrowRightAltIcon size="18" />
    </KPClickAnimation>
  );
};

export default Points;
