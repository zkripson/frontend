import usePrivyLinkedAccounts from "@/hooks/usePrivyLinkedAccounts";
import useAppActions from "@/store/app/actions";
import {
  KPProfileBadge,
  KPTimer,
  KPIconButton,
  KPClickAnimation,
} from "@/components";
import HowToPlay from "./how-to-play";
import Turn from "./turn";
import { useAudio } from "@/providers/AudioProvider";
import { useEffect, useState } from "react";
import { Howler } from "howler";
import { ArrowIcon } from "@/public/icons";

interface GameHeaderProps {
  mode: "setup" | "game";
  yourTurn?: boolean;
  turnStartedAt?: number;
  gameCode?: string;
  onTurnExpiry?: () => void;
  gameTimeRemaining?: number;
  inventoryVisible: boolean;
  setInventoryVisible: (boolean: boolean) => void;
}

export function GameHeader({
  mode,
  yourTurn,
  turnStartedAt,
  gameCode,
  onTurnExpiry,
  gameTimeRemaining,
  inventoryVisible,
  setInventoryVisible,
}: GameHeaderProps) {
  const { linkedFarcaster, linkedTwitter } = usePrivyLinkedAccounts();
  const { showToast } = useAppActions();
  const audio = useAudio();

  // Mute toggle state
  const [muted, setMuted] = useState(() => {
    // Initialize with Howler's current state
    return Howler.volume() === 0;
  });

  // When muted state changes, ensure Howler's volume is set correctly
  useEffect(() => {
    Howler.volume(muted ? 0 : 1);
  }, [muted]);

  const username = linkedFarcaster?.username || linkedTwitter?.username || "";
  const pfp =
    linkedFarcaster?.pfp || linkedTwitter?.profilePictureUrl || undefined;

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

        {mode !== "game" && (
          <KPClickAnimation
            onClick={() => setInventoryVisible(!inventoryVisible)}
            className="flex bp1215:hidden items-center justify-center gap-3 bg-primary-450/25 border border-primary-50 rounded-full h-[25px] px-2 capitalize"
          >
            <span
              style={{
                display: "inline-block",
                transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
                transform: inventoryVisible ? "rotate(180deg)" : "rotate(0deg)",
              }}
            >
              <ArrowIcon />
            </span>
            <span className="text-[12px] leading-none text-primary-50">
              {inventoryVisible ? "hide" : "show"} inventory
            </span>
          </KPClickAnimation>
        )}
      </div>

      <div className="flex flex-col-reverse items-end lg:flex-row lg:items-center gap-2 lg:gap-6 h-full pointer-events-auto">
        <div className="flex flex-col-reverse md:flex-row items-end md:items-center gap-2 lg:gap-3 pointer-events-auto">
          {mode === "game" && <Turn yourTurn={yourTurn} />}
          <div className="flex items-center gap-2 lg:gap-3 pointer-events-auto">
            {mode === "game" && gameTimeRemaining !== 0 && (
              <KPTimer turnStartedAt={turnStartedAt} onExpire={onTurnExpiry} />
            )}
            {mode === "game" && (
              <div className="h-8 lg:h-10 w-0.5 bg-primary-50" />
            )}
            {mode === "game" && <KPTimer isGame />}
          </div>
        </div>
        {gameCode && <KPIconButton icon="share" onClick={handleShareInvite} />}
        <KPIconButton icon={muted ? "unmute" : "mute"} onClick={onMute} />
      </div>
    </div>
  );
}
