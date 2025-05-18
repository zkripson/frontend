"use client";
import usePrivyLinkedAccounts from "@/hooks/usePrivyLinkedAccounts";
import useSystemFunctions from "@/hooks/useSystemFunctions";
import KPProfileBadge from "../profile-badge";
import useBalance from "@/hooks/useBalance";
import { useEffect } from "react";
import TOKEN_ADDRESSES from "@/constants/tokenAddresses";

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
  }, [activeWallet]);

  return (
    <div className="layout-header-container">
      <header className="fixed top-0 left-0 w-full z-20 px-[5vw] py-[1vh] flex justify-between items-center bg-material">
        <h1 className="font-MachineStd text-primary-300 text-[clamp(20px,5vw,2rem)] leading-none -mb-2">
          BATTLESHIP GAME
        </h1>

        {showProfileBadge && (
          <div className="shrink-0 w-fit">
            <KPProfileBadge avatarUrl={pfp} username={username} />
          </div>
        )}
      </header>
    </div>
  );
};

export default KPHeader;
