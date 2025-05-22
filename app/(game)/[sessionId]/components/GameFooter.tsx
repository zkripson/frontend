"use client";

import { KPGameBadge } from "@/components";
import useTruncateText from "@/hooks/useTruncateText";
import usePrivyLinkedAccounts from "@/hooks/usePrivyLinkedAccounts";
import General, { GeneralMessageKey } from "./general";
import Info from "./info";
import useSystemFunctions from "@/hooks/useSystemFunctions";

interface GameFooterProps {
  overlaps: { x: number; y: number }[];
  infoShow: boolean;
  setUserDismissedInfo: (value: boolean) => void;
  generalMessage: { key: GeneralMessageKey; id: number } | null;
  playerAddress: string;
  opponentAddress?: string;
  playerStatus: string;
  opponentStatus: string;
  mode: "setup" | "game";
}

export function GameFooter({
  overlaps,
  infoShow,
  setUserDismissedInfo,
  generalMessage,
  playerAddress,
  opponentAddress,
  playerStatus,
  opponentStatus,
  mode,
}: GameFooterProps) {
  const {
    playerState: { opponentProfile },
  } = useSystemFunctions();

  const showWarning = overlaps.length > 0;

  // YOUR profile from Privy-linked accounts
  const { linkedFarcaster, linkedTwitter } = usePrivyLinkedAccounts();
  const username = linkedFarcaster?.username || linkedTwitter?.username || "";
  const pfp =
    linkedFarcaster?.pfp || linkedTwitter?.profilePictureUrl || undefined;

  // Opponent’s truncated address
  const { truncatedText: opponentName } = useTruncateText(
    opponentAddress,
    5,
    5
  );

  return (
    <div className="fixed bottom-[2%] right-0 w-full px-5 lg:px-12">
      <div className="hidden lg:flex items-center justify-between w-full">
        <div className="flex items-end gap-7">
          <KPGameBadge
            status={playerStatus}
            username={username || playerAddress}
            avatarUrl={pfp}
            isPlayer
          />
          <General
            messageKey={generalMessage?.key ?? null}
            uniqueId={generalMessage?.id}
          />
        </div>

        <Info
          show={showWarning ? true : infoShow}
          type={showWarning ? "warning" : "info"}
          warningTitle={showWarning ? "INCORRECT PLACEMENT:" : undefined}
          message={
            showWarning
              ? "You can’t place multiple ships overlapping one grid space."
              : "You’ll be notified when your opponent joins. Game starts when both players are ready."
          }
          onStopShowing={() => setUserDismissedInfo(true)}
        />

        <KPGameBadge
          status={opponentStatus}
          username={opponentProfile?.username || opponentName || "–"}
          avatarUrl={opponentProfile?.avatar || undefined}
          isPlayer={false}
        />
      </div>

      <div className="flex flex-col items-center space-y-4 lg:hidden w-full">
        <Info
          show={showWarning ? true : infoShow}
          type={showWarning ? "warning" : "info"}
          warningTitle={showWarning ? "INCORRECT PLACEMENT:" : undefined}
          message={
            showWarning
              ? "You can’t place multiple ships overlapping one grid space."
              : "You’ll be notified when your opponent joins. Game starts when both players are ready."
          }
          onStopShowing={() => setUserDismissedInfo(true)}
        />

        <div className="flex space-x-4 w-full justify-between">
          <KPGameBadge
            status={playerStatus}
            username={username || playerAddress}
            avatarUrl={pfp}
            isPlayer
          />
          <KPGameBadge
            status={opponentStatus}
            username={opponentProfile?.username || opponentName || "–"}
            avatarUrl={opponentProfile?.avatar || undefined}
            isPlayer={false}
          />
        </div>
      </div>
    </div>
  );
}

export default GameFooter;
