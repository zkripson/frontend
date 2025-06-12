"use client";

import { KPGameBadge } from "@/components";
import useTruncateText from "@/hooks/useTruncateText";
import usePrivyLinkedAccounts from "@/hooks/usePrivyLinkedAccounts";
import General, { GeneralMessageKey } from "./general";
import Info from "./info";
import useSystemFunctions from "@/hooks/useSystemFunctions";
import { useParams } from "next/navigation";
import { AI_OPPONENTS } from "@/constants/aiOpponents";

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
  isComputerGame?: boolean;
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
  isComputerGame,
}: GameFooterProps) {
  const {
    playerState: { opponentProfile },
    appState,
  } = useSystemFunctions();
  const params = useParams();
  const difficulty = params?.difficulty as string | undefined;

  const aiOpponent =
    isComputerGame && difficulty ? AI_OPPONENTS[difficulty] : null;

  const showWarning = overlaps.length > 0;

  // YOUR profile from Privy-linked accounts
  const { linkedFarcaster, linkedTwitter } = usePrivyLinkedAccounts();
  const username =
    appState?.farcasterContext?.username || linkedTwitter?.username || "";
  const pfp =
    appState?.farcasterContext?.pfpUrl ||
    linkedTwitter?.profilePictureUrl ||
    undefined;

  // Opponent’s truncated address
  const { truncatedText: opponentName } = useTruncateText(
    opponentAddress,
    5,
    5
  );

  const opponentNameOrAI = isComputerGame
    ? aiOpponent?.name
    : opponentProfile?.username || opponentName || "–";
  const opponentPfp = isComputerGame
    ? aiOpponent?.avatarUrl
    : opponentProfile?.avatar || undefined;

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
          username={opponentNameOrAI}
          avatarUrl={opponentPfp}
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
            username={opponentNameOrAI}
            avatarUrl={opponentPfp}
            isPlayer={false}
          />
        </div>
      </div>
    </div>
  );
}

export default GameFooter;
