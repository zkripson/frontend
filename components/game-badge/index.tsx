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
    <div className="flex flex-col gap-1.5 items-start justify-start w-full max-w-[240px]">
      <h1 className="text-primary-50 text-[14px] font-medium uppercase">
        {isPlayer ? "You" : "Opponent"} - {status}
      </h1>

      <div
        className="w-full px-3 h-[69px] rounded-[4px] bg-primary-250 border border-primary-350 flex items-center gap-2.5 transition-all duration-500"
        style={{
          boxShadow: "inset 0px 4px 0px 0px #5D656E",
        }}
      >
        <div className="flex items-center gap-3">
          <Image
            src={avatarUrl || "/images/kripson.jpeg"}
            alt={username}
            width={300}
            height={300}
            className={classNames("size-8 rounded-full object-cover", {
              "opacity-50": status === "joining...",
            })}
            quality={100}
          />

          <span
            className={classNames(
              "text-white text-[20px] leading-none font-medium",
              {
                "opacity-50": status === "joining...",
              }
            )}
          >
            {username}
          </span>

          {isPlayer && <div className="w-3 h-3 bg-primary-650 rounded-full" />}
        </div>
      </div>
    </div>
  );
};

export default KPGameBadge;
