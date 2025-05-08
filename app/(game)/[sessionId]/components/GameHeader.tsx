import { KPProfileBadge, KPTimer, KPIconButton } from "@/components";
import HowToPlay from "./how-to-play";
import Turn from "./turn";
import usePrivyLinkedAccounts from "@/hooks/usePrivyLinkedAccounts";

interface GameHeaderProps {
  mode: "setup" | "game";
  onPause: () => void;
  onHam: () => void;
}

export function GameHeader({ mode, onPause, onHam }: GameHeaderProps) {
  const { linkedFarcaster, linkedTwitter } = usePrivyLinkedAccounts();

  const username = linkedFarcaster?.username || linkedTwitter?.username || "";
  const pfp =
    linkedFarcaster?.pfp || linkedTwitter?.profilePictureUrl || undefined;

  return (
    <div className="fixed top-[4%] lg:top-[3%] xl:top-[5%] left-0 flex lg:items-center justify-between w-full px-5 lg:px-12 z-[9999]">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <KPProfileBadge
          avatarUrl={pfp}
          username={username}
          variant="secondary"
          balance={37.56}
        />
        <HowToPlay />
      </div>

      <div className="flex flex-col-reverse items-end lg:flex-row lg:items-center gap-4 lg:gap-6">
        {mode === "game" && <Turn yourTurn={true} />}
        <KPTimer initialSeconds={60} />
        <KPIconButton icon="pause" onClick={onPause} />
        <KPIconButton icon="ham" onClick={onHam} />
      </div>
    </div>
  );
}
