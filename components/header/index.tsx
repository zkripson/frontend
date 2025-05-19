"use client";
import usePrivyLinkedAccounts from "@/hooks/usePrivyLinkedAccounts";
import useSystemFunctions from "@/hooks/useSystemFunctions";
import KPProfileBadge from "../profile-badge";
import useBalance from "@/hooks/useBalance";
import { useEffect } from "react";
import TOKEN_ADDRESSES from "@/constants/tokenAddresses";
import classNames from "classnames";

const KPHeader = () => {
  const { checkTokenBalance } = useBalance();
  const { pathname } = useSystemFunctions();
  const { linkedFarcaster, linkedTwitter, activeWallet } =
    usePrivyLinkedAccounts();

  const username = linkedFarcaster?.username || linkedTwitter?.username || "";
  const pfp =
    linkedFarcaster?.pfp || linkedTwitter?.profilePictureUrl || undefined;
  const showProfileBadge = pathname === "/new-game";

  useEffect(() => {
    checkTokenBalance(TOKEN_ADDRESSES.USDC);
    checkTokenBalance(TOKEN_ADDRESSES.SHIP);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWallet?.address]);

  return (
    <div className="layout-header-container">
      <header
        className={classNames(
          "fixed top-0 left-0 w-full z-20 px-[5vw] flex justify-between items-center bg-material",
          {
            "py-[1vh]": showProfileBadge,
            "py-[1.5vh]": !showProfileBadge,
          }
        )}
      >
        <h1 className="font-MachineStd text-primary-300 text-[clamp(20px,5vw,2rem)] leading-none -mb-2">
          BATTLESHIP GAME
        </h1>

        {showProfileBadge && (
          <div className="shrink-0 w-fit">
            <KPProfileBadge avatarUrl={pfp} username={username} />
          </div>
        )}

        <a
          href="https://metastablelabs.notion.site/How-to-Play-1f7716767cb480ae98d5f45877e033c6?pvs=4"
          target="_blank"
          className="ttext-[clamp(12px,5vw,14px)] text-primary-300 underline font-semibold"
        >
          How to play?
        </a>
      </header>
    </div>
  );
};

export default KPHeader;
