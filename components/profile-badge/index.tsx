import Image from "next/image";
import classNames from "classnames";

const KPProfileBadge = ({
  username,
  avatarUrl,
  variant = "primary",
  balance,
}: IKPProfileBadge) => {
  return (
    <div
      className={classNames(
        "flex items-center rounded-full justify-between border",
        {
          "bg-primary-450 border-primary-300 w-full max-w-fit px-2 py-2.5 gap-2":
            variant === "primary",
          "bg-primary-450/25 border-primary-50 w-fit lg:max-w-72 xl:max-w-96 h-[31.33px] lg:h-9 xl:h-12 lg:p-1.5 px-1 backdrop-blur-[1px] gap-2 lg:gap-6":
            variant === "secondary",
        }
      )}
    >
      <div className="flex items-center gap-2">
        <Image
          src={avatarUrl || "/images/kripson.jpeg"}
          alt={username}
          width={300}
          height={300}
          className="size-5 lg:size-8 rounded-full object-cover"
          quality={100}
        />

        <span
          className={classNames("text-[9px] lg:text-[14px] leading-none", {
            "text-primary-300": variant === "primary",
            "text-white": variant === "secondary",
          })}
        >
          @{username}
        </span>
      </div>

      <div
        className={classNames({
          "flex-shrink-0": variant === "primary",
          "flex items-center justify-center gap-2": variant === "secondary",
        })}
      >
        <Image
          src="/images/farcaster.png"
          alt="farcaster"
          width={32}
          height={32}
          quality={100}
          className="size-5 lg:size-8 object-cover rounded-full"
        />

        {variant === "secondary" && (
          <div className="py-1 px-1.5 rounded-full bg-primary-450/25 border border-primary-50 backdrop-blur-[2px] flex items-center justify-center gap-1 text-white">
            <span className="text-[13px] leading-none font-medium">
              ${balance}
            </span>
            <span className="text-[9px] leading-none">$SHIP</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default KPProfileBadge;
