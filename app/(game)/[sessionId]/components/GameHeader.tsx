import { useEffect, useState } from "react";

import usePrivyLinkedAccounts from "@/hooks/usePrivyLinkedAccounts";
import useAppActions from "@/store/app/actions";
import { KPProfileBadge, KPTimer, KPIconButton } from "@/components";
import HowToPlay from "./how-to-play";
import { useAudio } from "@/providers/AudioProvider";
import { Howler } from "howler";
import useSystemFunctions from "@/hooks/useSystemFunctions";

interface GameHeaderProps {
  mode: "setup" | "game";
  turnStartedAt?: number;
  onTurnExpiry?: () => void;
  gameTimeRemaining?: number;
  isComputerGame?: boolean;
}

export function GameHeader({
  mode,
  turnStartedAt,
  onTurnExpiry,
  gameTimeRemaining,
  isComputerGame,
}: GameHeaderProps) {
  const { linkedFarcaster, linkedTwitter } = usePrivyLinkedAccounts();
  const { showToast } = useAppActions();
  const audio = useAudio();
  const { appState } = useSystemFunctions();

  const [gameCode, setGameCode] = useState<string | null>(null);

  // Mute toggle state
  const [muted, setMuted] = useState(() => {
    // Initialize with Howler's current state
    return Howler.volume() === 0;
  });

  // When muted state changes, ensure Howler's volume is set correctly
  useEffect(() => {
    Howler.volume(muted ? 0 : 1);
  }, [muted]);

  const username =
    appState?.farcasterContext?.username || linkedTwitter?.username || "";
  const pfp =
    appState?.farcasterContext?.pfpUrl ||
    linkedTwitter?.profilePictureUrl ||
    undefined;

  const handleShareInvite = async () => {
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

  const onMute = () => {
    if (audio) {
      const newMutedState = !muted;
      setMuted(newMutedState);

      if (newMutedState) {
        audio.mute();
        Howler.volume(0);
      } else {
        audio.unmute();
        Howler.volume(1);
      }
    }
  };

  useEffect(() => {
    const gameCode = localStorage.getItem("gameCode");

    if (gameCode) {
      setGameCode(gameCode);
    }
  }, []);

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

      <div className="flex flex-col-reverse items-end lg:flex-row lg:items-center gap-2 lg:gap-6 h-full pointer-events-auto">
        {!isComputerGame && (
          <div className="flex flex-col-reverse md:flex-row items-end md:items-center gap-2 lg:gap-3 pointer-events-auto">
            <div className="flex items-center gap-2 lg:gap-3 pointer-events-auto">
              {mode === "game" && gameTimeRemaining !== 0 && (
                <KPTimer
                  turnStartedAt={turnStartedAt}
                  onExpire={onTurnExpiry}
                />
              )}
              {mode === "game" && (
                <div className="h-8 lg:h-10 w-0.5 bg-primary-50" />
              )}
              {mode === "game" && <KPTimer isGame />}
            </div>
          </div>
        )}
        {gameCode && <KPIconButton icon="share" onClick={handleShareInvite} />}
        <KPIconButton icon={muted ? "unmute" : "mute"} onClick={onMute} />
      </div>
    </div>
  );
}
