import { KPGameBadge } from "@/components";
import General, { GeneralMessageKey } from "./general";
import Info from "./info";

interface GameFooterProps {
  overlaps: { x: number; y: number }[];
  infoShow: boolean;
  setUserDismissedInfo: (value: boolean) => void;
  generalMessageKey: GeneralMessageKey;
}

export function GameFooter({
  overlaps,
  infoShow,
  setUserDismissedInfo,
  generalMessageKey,
}: GameFooterProps) {
  const showWarning = overlaps.length > 0;

  return (
    <div className="fixed bottom-[2%] right-0 w-full px-5 lg:px-12">
      <div className="hidden lg:flex items-center justify-between w-full">
        <div className="flex items-end gap-7 min-w-96">
          <KPGameBadge status="ready" username="Choco" isPlayer />
          <General show={true} messageKey={generalMessageKey} />
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
          status="joining..."
          username="Njoku"
          avatarUrl="/images/kripson.jpeg"
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
          <KPGameBadge status="ready" username="Choco" isPlayer />
          <KPGameBadge
            status="joining..."
            username="Njoku"
            avatarUrl="/images/kripson.jpeg"
            isPlayer={false}
          />
        </div>
      </div>
    </div>
  );
}
