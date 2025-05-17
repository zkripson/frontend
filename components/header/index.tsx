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
  const { linkedFarcaster, linkedTwitter, evmWallet } =
    usePrivyLinkedAccounts();

  const username = linkedFarcaster?.username || linkedTwitter?.username || "";
  const pfp =
    linkedFarcaster?.pfp || linkedTwitter?.profilePictureUrl || undefined;
  const showProfileBadge = pathname === "/new-game";

  useEffect(() => {
    checkTokenBalance(TOKEN_ADDRESSES.USDC);
    checkTokenBalance(TOKEN_ADDRESSES.SHIP);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evmWallet]);

  return (
    <div className="layout-header-container">
      <header className="fixed top-0 left-0 w-full z-20 px-[5vw] py-[1vh] flex justify-between items-center bg-material">
        <div className="flex flex-col gap-[0.5vh] whitespace-nowrap">
          <h1 className="font-MachineStd text-primary-300 text-[clamp(20px,5vw,2rem)] leading-[clamp(20px,5vw,2rem)]">
            BATTLE.FUN GAME
          </h1>
          <h4 className="text-primary-550 text-[clamp(8px,5vw,0.75rem)] leading-[clamp(8px,5vw,0.75rem)]">
            powered by MEGAETH
          </h4>
        </div>

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
