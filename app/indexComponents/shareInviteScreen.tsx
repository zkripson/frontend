import { KPButton, KPDialougue, KPSecondaryLoader } from "@/components";
import useCopy from "@/hooks/useCopy";
import useSystemFunctions from "@/hooks/useSystemFunctions";
import useAppActions from "@/store/app/actions";

const ShareInviteScreen = ({ onBack }: { onBack: () => void }) => {
  const { navigate, inviteState } = useSystemFunctions();
  const { loadingInviteCreation, bettingCreation } = inviteState;
  const { showToast } = useAppActions();
  const { handleCopy } = useCopy("Copied Invite Code");

  const handleShareInvite = () => {
    if (navigator.share) {
      const domain = window.location.origin;

      const inviteLink = `${domain}/join-game?code=${bettingCreation?.code}`;

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

  const next = () => {
    if (!bettingCreation) return;

    navigate.push(`/${bettingCreation?.sessionId}`);
  };

  const createLoading = loadingInviteCreation || !bettingCreation?.code;
  const createPhaseActionText = createLoading ? "creating..." : "go to game";

  const shareActions: Array<IKPButton> = [
    { title: "send invite", onClick: () => handleShareInvite() },
    {
      title: "copy code instead",
      onClick: () => handleCopy(bettingCreation?.code!),
    },
  ];

  return (
    <KPDialougue
      title="add opponent"
      showBackButton
      onBack={onBack}
      primaryCta={{
        title: createPhaseActionText,
        onClick: next,
        icon: createLoading ? undefined : "arrow",
        iconPosition: "right",
        disabled: createLoading,
      }}
      className="pt-[88px]"
    >
      <div className="flex flex-col items-center gap-2 w-full">
        <div
          className="bg-material rounded-lg mb-3 w-full text-center flex items-center justify-center"
          style={{
            height: "clamp(3rem, 8vw, 5rem)",
            padding: "0 clamp(0.5rem, 2vw, 1rem)",
          }}
        >
          {createLoading ? (
            <KPSecondaryLoader size={12} />
          ) : (
            <span
              style={{
                fontSize: "clamp(18px, 3vw, 36px)",
                lineHeight: 1,
              }}
              className="tracking-[8px] md:tracking-[12px] font-semibold text-white"
            >
              {bettingCreation.code}
            </span>
          )}
        </div>

        {shareActions.map(({ onClick, title }, index) => (
          <KPButton
            key={index}
            title={title}
            onClick={onClick}
            isMachine
            fullWidth
            disabled={!bettingCreation || loadingInviteCreation}
          />
        ))}
      </div>
    </KPDialougue>
  );
};

export default ShareInviteScreen;
