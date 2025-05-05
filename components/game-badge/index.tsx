"use client";
import Image from "next/image";
import classNames from "classnames";

const KPGameBadge = ({
  status,
  avatarUrl,
  username,
  isPlayer,
}: IKPGameBadge) => {
  return (
    <div className="flex flex-col gap-1.5 items-start justify-start w-full max-w-[158px] lg:max-w-[200px] xl:max-w-[240px]">
      <h1 className="text-primary-50 text-[9px] lg:text-[11px] xl:text-[14px] font-medium uppercase">
        {isPlayer ? "You" : "Opponent"} - {status}
      </h1>

      <div className="w-full px-3 h-11 lg:h-14 xl:h-[69px] rounded-sm lg:rounded-[4px] bg-primary-250 border border-primary-350 flex items-center transition-all duration-500 shadow-[inset_0px_2.64px_0px_0px_#5D656E] lg:shadow-[inset_0px_4px_0px_0px_#5D656E]">
        <div className="flex items-center gap-3">
          <Image
            src={avatarUrl || "/images/kripson.jpeg"}
            alt={username}
            width={300}
            height={300}
            className={classNames(
              "size-[21.11px] lg:size-8  rounded-full object-cover",
              {
                "opacity-50": status === "joining...",
              }
            )}
            quality={100}
          />

          <span
            className={classNames(
              "text-white text-[13px] lg:text-[16px] xl:text-[20px] leading-none font-medium",
              {
                "opacity-50": status === "joining...",
              }
            )}
          >
            {username}
          </span>

          {isPlayer && (
            <div className="size-2 lg:size-3 bg-primary-650 rounded-full" />
          )}
        </div>
      </div>
    </div>
  );
};

export default KPGameBadge;
