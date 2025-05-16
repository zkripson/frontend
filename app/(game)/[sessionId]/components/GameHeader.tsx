import usePrivyLinkedAccounts from "@/hooks/usePrivyLinkedAccounts";
import useAppActions from "@/store/app/actions";
import useSystemFunctions from "@/hooks/useSystemFunctions";
import { KPProfileBadge, KPTimer, KPIconButton } from "@/components";
import HowToPlay from "./how-to-play";
import Turn from "./turn";
import { useAudio } from "@/providers/AudioProvider";
import { useEffect, useState } from "react";
import { Howler } from "howler";

interface GameHeaderProps {
  mode: "setup" | "game";
  yourTurn?: boolean;
  turnStartedAt?: number;
  gameCode?: string;
  onTurnExpiry?: () => void;
  gameTimeRemaining?: number;
}

export function GameHeader({
  mode,
  yourTurn,
  turnStartedAt,
  gameCode,
  onTurnExpiry,
  gameTimeRemaining,
}: GameHeaderProps) {
  const { linkedFarcaster, linkedTwitter } = usePrivyLinkedAccounts();
  const { showToast } = useAppActions();
  const {
    inviteState: { inviteCreation },
  } = useSystemFunctions();
  const audio = useAudio();

  // Mute toggle state synced with Howler
  const [muted, setMuted] = useState(false);

  // On mount, check Howler's mute state using Howler.volume() as a proxy
  useEffect(() => {
    setMuted(Howler.volume() === 0);
  }, []);

  // Listen for mute changes from other sources (if any)
  useEffect(() => {
    const interval = setInterval(() => {
      setMuted(Howler.volume() === 0);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const username = linkedFarcaster?.username || linkedTwitter?.username || "";
  const pfp =
    linkedFarcaster?.pfp || linkedTwitter?.profilePictureUrl || undefined;

  const inviteCode = inviteCreation?.code;

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

  // Mute handler: toggle all audio using AudioProvider
  const onMute = () => {
    if (audio) {
      if (muted) {
        audio.unmute();
        setMuted(false);
      } else {
        audio.mute();
        setMuted(true);
      }
    }
  };

  return (
    <div className="fixed top-[2.2%] lg:top-[3%] xl:top-[5%] left-0 flex lg:items-center justify-between w-full px-4 lg:px-12 z-[9999] pointer-events-none">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 h-fit pointer-events-auto">
        <KPProfileBadge
          avatarUrl={pfp}
          username={username}
          variant="secondary"
          balance={37.56}
        />
        <HowToPlay />
      </div>

      <div className="flex flex-col-reverse items-end lg:flex-row lg:items-center gap-4 lg:gap-6 h-full pointer-events-auto">
        {mode === "game" && <Turn yourTurn={yourTurn} />}
        {/* Turn timer display */}
        {mode === "game" && gameTimeRemaining !== 0 && (
          <KPTimer turnStartedAt={turnStartedAt} onExpire={onTurnExpiry} />
        )}
        {mode === "game" && (
          <div className="w-[48px] h-0.5 lg:h-[48px] lg:w-0.5 bg-primary-50" />
        )}
        {mode === "game" && <KPTimer isGame />}
        {gameCode && <KPIconButton icon="share" onClick={handleShareInvite} />}
        <KPIconButton icon={"mute"} onClick={onMute} />
      </div>
    </div>
  );
}
