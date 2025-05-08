"use client";
import { useState, useEffect, JSX } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import classNames from "classnames";

import {
  KPButton,
  KPDialougue,
  KPGameTypeCard,
  KPInput,
  KPProfileBadge,
} from "@/components";
import useInviteActions from "@/store/invite/actions";
import useSystemFunctions from "@/hooks/useSystemFunctions";
import usePrivyLinkedAccounts from "@/hooks/usePrivyLinkedAccounts";
import useCopy from "@/hooks/useCopy";
import useAppActions from "@/store/app/actions";

const schema = z.object({
  code: z.string().min(4, "Code is required"),
});

type NewGame = z.infer<typeof schema>;

const NewGame = () => {
  const {
    inviteState: {
      loadingInviteAcceptance,
      loadingInviteCreation,
      inviteCreation,
    },
    navigate,
  } = useSystemFunctions();
  const { linkedFarcaster, linkedTwitter } = usePrivyLinkedAccounts();
  const { acceptInvite, createInvite } = useInviteActions();
  const { showToast } = useAppActions();
  const { handleCopy } = useCopy("Copied Invite Code");
  const [step, setStep] = useState<NewGameStep>("joinGame");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<NewGame>({
    mode: "onSubmit",
    resolver: zodResolver(schema),
  });

  const codeValue = watch("code");

  const username = linkedFarcaster?.username || linkedTwitter?.username || "";
  const pfp =
    linkedFarcaster?.pfp || linkedTwitter?.profilePictureUrl || undefined;

  const onCreate = async () => {
    setStep("createGame");

    if (!inviteCreation || inviteCreation.expiresAt < Date.now()) {
      await createInvite();
    }
  };

  const gameTypes: GameType[] = [
    {
      id: "fm",
      name: "Friend's Match",
      description: "Invite from Farcaster or Email",
      action: onCreate,
    },
    {
      id: "qm",
      name: "Quick Match",
      description: "Get matched with random players",
      status: "coming soon",
    },
  ];

  const shareActions: Array<IKPButton> = [
    { title: "send invite", onClick: () => handleShareInvite() },
    {
      title: "copy code instead",
      onClick: () => handleCopy(inviteCreation?.code!),
    },
  ];

  const onSubmit = async () => await acceptInvite(codeValue);

  const next = () => {
    if (!inviteCreation) return;

    navigate.push(`/${inviteCreation?.sessionId}`);
  };

  const handleShareInvite = () => {
    if (navigator.share) {
      const domain = window.location.origin;

      const inviteLink = `${domain}/join-game?code=${inviteCreation?.code}`;

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

  const screens: Record<NewGameStep, JSX.Element> = {
    joinGame: (
      <KPDialougue
        title="welcome"
        showCloseButton
        primaryCta={{
          title: "Next",
          onClick: handleSubmit(onSubmit),
          icon: "arrow",
          iconPosition: "right",
          loading: loadingInviteAcceptance,
        }}
        className="pt-[88px]"
      >
        <div className="flex flex-col items-center gap-16 max-sm:gap-7 self-stretch w-full">
          <KPProfileBadge avatarUrl={pfp} username={username} />

          <div className="flex flex-col gap-2 w-full">
            <h1 className="text-[26px] max-sm:text-[20px] leading-none text-primary-50 font-MachineStd">
              choose new game:
            </h1>

            {gameTypes.map((game) => (
              <div
                key={game.id}
                onClick={() => {
                  if (!game.status && game.action) {
                    game.action();
                  }
                }}
              >
                <KPGameTypeCard
                  {...game}
                  className={classNames({
                    "border border-primary-200 transition-all duration-500 rounded-[4px]":
                      step === "createGame" && game.id === "fm",
                  })}
                />
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2 w-full">
            <h1 className="text-[26px] max-sm:text-[20px] leading-none text-primary-50 font-MachineStd">
              Join match:
            </h1>

            <KPInput
              name="code"
              placeholder="Enter invite code"
              register={register("code")}
              error={!!errors.code}
              className="w-full"
              type="text"
            />
          </div>
        </div>
      </KPDialougue>
    ),
    createGame: (
      <KPDialougue
        title="add opponent"
        showBackButton
        onBack={() => setStep("joinGame")}
        primaryCta={{
          title: "Next",
          onClick: next,
          icon: "arrow",
          iconPosition: "right",
        }}
        className="pt-[88px]"
      >
        <div className="flex flex-col items-center gap-2 w-full">
          <p className="bg-material px-2 pt-1.5 md:px-4 md:pt-4 md:pb-1.5 font-MachineStd text-[clamp(21px,_3vw,36px)] tracking-[10px] md:tracking-[20px] rounded-lg mb-3 w-full text-center">
            {loadingInviteCreation || !inviteCreation?.code
              ? "•••"
              : inviteCreation.code}
          </p>

          {shareActions.map(({ onClick, title }, index) => (
            <KPButton
              key={index}
              title={title}
              onClick={onClick}
              isMachine
              fullWidth
              disabled={!inviteCreation}
            />
          ))}
        </div>
      </KPDialougue>
    ),
  };

  return (
    <div className="w-full h-full flex items-center justify-center relative">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={step}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="absolute w-full h-full flex items-center justify-center"
        >
          {screens[step]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default NewGame;
