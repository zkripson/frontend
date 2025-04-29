"use client";

import { useEffect, useState } from "react";
import useSystemFunctions from "@/hooks/useSystemFunctions";
import KPProfileBadge from "../profile-badge";
import classNames from "classnames";

const user = {
  username: "Dazeign",
};

const KPHeader = () => {
  const { pathname } = useSystemFunctions();
  const showProfileBadge = pathname === "/new-game";

  const [isShortHeight, setIsShortHeight] = useState(false);

  useEffect(() => {
    const checkHeight = () => {
      setIsShortHeight(window.innerHeight < 920);
    };

    checkHeight();
    window.addEventListener("resize", checkHeight);

    return () => window.removeEventListener("resize", checkHeight);
  }, []);

  return (
    <div className="layout-header-container">
      <header
        className={`fixed top-0 left-0 w-full z-20 px-[5vw] py-[2vh] flex justify-between items-center ${
          isShortHeight ? "bg-transparent" : "bg-material"
        }`}
      >
        <div className="flex flex-col gap-[0.5vh]">
          <h1
            className={`text-[2rem] leading-[2rem] font-MachineStd ${
              isShortHeight
                ? "bg-material bg-clip-text text-transparent"
                : "text-primary-300"
            }`}
          >
            BATTLE.FUN GAME
          </h1>
          <h4
            className={classNames("text-[0.75rem] leading-[0.75rem]", {
              "text-primary-550": !isShortHeight,
              "text-primary-150": isShortHeight,
            })}
          >
            powered by MEGAETH
          </h4>
        </div>

        {showProfileBadge && (
          <div className="shrink-0 w-[200px]">
            <KPProfileBadge {...user} />
          </div>
        )}
      </header>
    </div>
  );
};

export default KPHeader;
