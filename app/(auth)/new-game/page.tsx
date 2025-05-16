"use client";
import { useState, JSX } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import classNames from "classnames";

import {
  KPButton,
  KPClickAnimation,
  KPDialougue,
  KPGameTypeCard,
  KPInput,
  KPProfileBadge,
  KPSecondaryLoader,
} from "@/components";
import useInviteActions from "@/store/invite/actions";
import useSystemFunctions from "@/hooks/useSystemFunctions";
import usePrivyLinkedAccounts from "@/hooks/usePrivyLinkedAccounts";
import useCopy from "@/hooks/useCopy";
import useAppActions from "@/store/app/actions";
import { BackIcon } from "@/public/icons";

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
  const [phase, setPhase] = useState<"select" | "create">("select");
  const [isJoining, setJoining] = useState(false);

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
    setPhase("create");

    createInvite();
  };

  const toggleJoin = () => setJoining(true);

  const gameTypes = [
    {
      id: "create",
      name: "Create Invite",
      description: "Generate a link to share with friends",
      action: onCreate,
      disabled: false,
    },
    {
      id: "join",
      name: "Join a Game",
      description: "Enter an invite code to join",
      action: toggleJoin,
      disabled: false,
    },
    {
      id: "quick",
      name: "Quick Match",
      description: "Get matched with random players",
      action: () => {},
      disabled: true,
      status: "coming soon",
    },
  ];

  const shareActions: Array<IKPButton> = [
    { title: "send invite", onClick: () => handleShareInvite() },
    {
      title: "copy code instead",
      onClick: () => handleCopy(inviteCreation?.code!, true),
    },
  ];

  const createLoading = loadingInviteCreation || !inviteCreation?.code;
  const createPhaseActionText = createLoading ? "creating..." : "go to game";

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

  const screens: Partial<Record<NewGameStep, JSX.Element>> = {
    select: (
      <KPDialougue
        title="welcome"
        showCloseButton
        primaryCta={{
          title: "Next",
          onClick: handleSubmit(onSubmit),
          icon: "arrow",
          iconPosition: "right",
          loading: loadingInviteAcceptance,
          hide: !isJoining,
        }}
        className="pt-[88px]"
      >
        <div className="flex flex-col items-center gap-16 max-sm:gap-7 self-stretch w-full">
          <KPProfileBadge avatarUrl={pfp} username={username} />

          <motion.div
            className="flex flex-col gap-2 w-full overflow-hidden"
            initial={{ height: "auto", opacity: 1 }}
            animate={
              isJoining
                ? { height: 0, opacity: 0 }
                : { height: "auto", opacity: 1 }
            }
            transition={{ duration: 0.4 }}
          >
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
                      phase === "create" && game.id === "create",
                  })}
                />
              </div>
            ))}
          </motion.div>

          <motion.div
            className="flex flex-col gap-2 w-full overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={
              isJoining
                ? { height: "auto", opacity: 1 }
                : { height: 0, opacity: 0 }
            }
            transition={{ duration: 0.4 }}
          >
            <div className="relative w-full">
              <div className="absolute h-full top-0 left-0">
                <KPClickAnimation onClick={() => setJoining(false)}>
                  <BackIcon width={25} height={18} />
                </KPClickAnimation>
              </div>
              <h1 className="text-[26px] max-sm:text-[20px] leading-none text-primary-50 font-MachineStd">
                Join match:
              </h1>
            </div>

            <KPInput
              name="code"
              placeholder="Enter invite code"
              register={register("code")}
              error={!!errors.code}
              className="w-full"
              type="text"
            />
          </motion.div>
        </div>
      </KPDialougue>
    ),
    create: (
      <KPDialougue
        title="add opponent"
        showBackButton
        onBack={() => setPhase("select")}
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
                  fontSize: "clamp(21px, 3vw, 36px)",
                  lineHeight: 1,
                }}
                className="tracking-[8px] md:tracking-[12px] font-semibold"
              >
                {inviteCreation.code}
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
          key={phase}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="absolute w-full h-full flex items-center justify-center"
        >
          {screens[phase]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default NewGame;
