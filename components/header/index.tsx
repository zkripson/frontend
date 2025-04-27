import useSystemFunctions from "@/hooks/useSystemFunctions";
import KPProfileBadge from "../profile-badge";

const user = {
  username: "Dazeign",
};

const KPHeader = () => {
  const { pathname } = useSystemFunctions();

  const showProfileBadge = pathname === "/new-game";

  return (
    <div className="layout-header-container">
      <header className="w-full fixed flex justify-between items-center top-0 z-20 bg-material backdrop-blur-sm px-10 py-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-[32px] leading-[32px] text-primary-300 font-MachineStd">
            BATTLE.FUN GAME
          </h1>
          <h4 className="text-[12px] leading-[12px] text-primary-550">
            powered by MEGAETH
          </h4>
        </div>

        {showProfileBadge && <KPProfileBadge {...user} />}
      </header>
    </div>
  );
};

export default KPHeader;
