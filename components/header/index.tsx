"use client";
import usePrivyLinkedAccounts from "@/hooks/usePrivyLinkedAccounts";
import useSystemFunctions from "@/hooks/useSystemFunctions";
import KPProfileBadge from "../profile-badge";

const KPHeader = () => {
  const { pathname } = useSystemFunctions();
  const { linkedFarcaster, linkedTwitter } = usePrivyLinkedAccounts();

  const username = linkedFarcaster?.username || linkedTwitter?.username || "";
  const pfp =
    linkedFarcaster?.pfp || linkedTwitter?.profilePictureUrl || undefined;
  const showProfileBadge = pathname === "/new-game";

  return (
    <div className="layout-header-container">
      <header className="fixed top-0 left-0 w-full z-20 px-[5vw] py-[1vh] flex justify-between items-center bg-material">
        <div className="flex flex-col gap-[0.5vh]">
          <h1 className="text-[2rem] leading-[2rem] font-MachineStd text-primary-300">
            BATTLE.FUN GAME
          </h1>
          <h4 className="text-[0.75rem] leading-[0.75rem] text-primary-550">
            powered by MEGAETH
          </h4>
        </div>

        {showProfileBadge && (
          <div className="shrink-0 w-fit hidden md:block">
            <KPProfileBadge avatarUrl={pfp} username={username} />
          </div>
        )}
      </header>
    </div>
  );
};

export default KPHeader;
