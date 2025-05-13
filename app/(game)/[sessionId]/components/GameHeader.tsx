import usePrivyLinkedAccounts from "@/hooks/usePrivyLinkedAccounts";
import useAppActions from "@/store/app/actions";
import useSystemFunctions from "@/hooks/useSystemFunctions";
import { KPProfileBadge, KPTimer, KPIconButton } from "@/components";
import HowToPlay from "./how-to-play";
import Turn from "./turn";

interface GameHeaderProps {
  mode: "setup" | "game";
  onHam: () => void;
  yourTurn?: boolean;
  turnStartedAt?: number;
  gameCode?: string;
}

export function GameHeader({
  mode,
  onHam,
  yourTurn,
  turnStartedAt,
}: GameHeaderProps) {
  const { linkedFarcaster, linkedTwitter } = usePrivyLinkedAccounts();
  const { showToast } = useAppActions();
  const {
    inviteState: { inviteCreation, inviteAcceptance },
  } = useSystemFunctions();

  const username = linkedFarcaster?.username || linkedTwitter?.username || "";
  const pfp =
    linkedFarcaster?.pfp || linkedTwitter?.profilePictureUrl || undefined;

  const gameCode = inviteCreation?.code;

  const handleShareInvite = () => {
    if (navigator.share) {
      const domain = window.location.origin;

      const inviteLink = `${domain}/join-game?code=${gameCode}`;

      navigator
        .share({
          title: "Join My Game!",
          text: "I'd like to invite you to play with me! Click the link to join.",
          url: inviteLink,
        })
        .then(() => console.log("Successfully shared"))
        .catch((error) => showToast("Share Cancelled", "error"));
    } else {
      console.log("Share API not supported on this device");
    }
  };

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
        {mode === "game" && <Turn yourTurn={yourTurn} />}
        <KPTimer turnStartedAt={turnStartedAt!} />
        {gameCode && <KPIconButton icon="share" onClick={handleShareInvite} />}
        <KPIconButton icon="ham" onClick={onHam} />
      </div>
    </div>
  );
}
