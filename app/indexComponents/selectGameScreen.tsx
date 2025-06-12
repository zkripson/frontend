import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import classNames from "classnames";

import { KPDialougue, KPGameCodeInput, KPGameTypeCard } from "@/components";
import useInviteActions from "@/store/invite/actions";
import useSystemFunctions from "@/hooks/useSystemFunctions";
import { useAudio } from "@/providers/AudioProvider";
import useWithdrawal from "@/hooks/useWithdrawal";
import { setInvitation } from "@/store/invite";

const SelectGameScreen = ({
  nextScreen,
  phase,
  onBack,
}: {
  nextScreen: () => void;
  phase: "select" | "stake" | "create";
  onBack: () => void;
}) => {
  const {
    inviteState: { loadingInviteAcceptance, invitation, invitationLoading },
    dispatch,
  } = useSystemFunctions();
  const { acceptBettingInvite } = useInviteActions();
  const { approveTransfer } = useWithdrawal();
  const audio = useAudio();

  const [isJoining, setJoining] = useState(false);
  const [canAccept, setCanAccept] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    try {
      if (!code || !invitation?.stakeAmount) return;

      setLoading(true);
      await approveTransfer(Number(invitation.stakeAmount));

      await acceptBettingInvite(code);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const gameTypes = [
    {
      id: "create",
      name: "Create Invite",
      description: "Generate a link to share with friends",
      action: nextScreen,
      disabled: false,
    },
    {
      id: "join",
      name: "Join a Game",
      description: "Enter an invite code to join",
      action: () => {
        dispatch(setInvitation(null));
        setJoining(true);
      },
      disabled: false,
    },
    // {
    //   id: "quick",
    //   name: "Quick Match",
    //   description: "Get matched with random players",
    //   action: () => {},
    //   disabled: true,
    //   status: "coming soon",
    // },
  ];

  const selects = [
    <div key="choose" className="flex flex-col gap-2 w-full overflow-hidden">
      <h1 className="text-[26px] max-sm:text-[20px] leading-none text-primary-50 font-MachineStd">
        choose new game:
      </h1>

      {gameTypes.map((game) => (
        <KPGameTypeCard
          key={game.id}
          {...game}
          className={classNames({
            "border border-primary-200 transition-all duration-500 rounded-[4px]":
              phase === "create" && game.id === "create",
          })}
        />
      ))}
    </div>,

    <KPGameCodeInput
      onBack={() => setJoining(false)}
      setCanAccept={setCanAccept}
      key={"join"}
      setCode={setCode}
    />,
  ];

  return (
    <KPDialougue
      title="welcome"
      showCloseButton
      showBackButton
      onBack={onBack}
      primaryCta={{
        title: "Next",
        onClick: onSubmit,
        icon: "arrow",
        iconPosition: "right",
        loading: loadingInviteAcceptance || invitationLoading || loading,
        disabled: !canAccept || loadingInviteAcceptance || loading,
        hide: !isJoining,
      }}
      showPoints={!isJoining}
      className="pt-[88px]"
    >
      <div className="flex flex-col items-center gap-16 max-sm:gap-7 self-stretch w-full">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={isJoining ? "join" : "create"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            {selects[+isJoining]}
          </motion.div>
        </AnimatePresence>
      </div>
    </KPDialougue>
  );
};

export default SelectGameScreen;
