"use client";
import { useState, useEffect, JSX } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import classNames from "classnames";

import {
  KPDialougue,
  KPGameTypeCard,
  KPInput,
  KPProfileBadge,
} from "@/components";
import useInviteActions from "@/store/invite/actions";
import useSystemFunctions from "@/hooks/useSystemFunctions";
import usePrivyLinkedAccounts from "@/hooks/usePrivyLinkedAccounts";

const schema = z.object({
  code: z.string().min(4, "Code is required"),
});

type NewGame = z.infer<typeof schema>;

const NewGame = () => {
  const {
    inviteState: { loadingInviteAcceptance, loadingInviteCreation },
  } = useSystemFunctions();
  const { linkedFarcaster, linkedTwitter } = usePrivyLinkedAccounts();
  const { acceptInvite, createInvite } = useInviteActions();
  const [step, setStep] = useState<NewGameStep>("chooseGame");
  const [gameInitiationType, setGameInitiationType] = useState<
    "create" | "accept"
  >("create");

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

  useEffect(() => {
    if (codeValue && codeValue.length > 0) {
      setGameInitiationType("accept");
    } else {
      setGameInitiationType("create");
    }
  }, [codeValue]);

  const gameTypes: GameType[] = [
    {
      id: "fm",
      name: "Friend's Match",
      description: "Invite from Farcaster or Email",
      action: () => setGameInitiationType("create"),
    },
    {
      id: "qm",
      name: "Quick Match",
      description: "Get matched with random players",
      status: "coming soon",
    },
  ];

  const onSubmit = async () => {
    if (gameInitiationType === "create") {
      await createInvite();
    } else {
      await acceptInvite(codeValue);
    }
  };

  const screens: Record<NewGameStep, JSX.Element> = {
    chooseGame: (
      <KPDialougue
        title="welcome"
        showCloseButton
        onClose={() => {}}
        primaryCta={{
          title: "Next",
          onClick: onSubmit,
          icon: "arrow",
          iconPosition: "right",
          loading: loadingInviteAcceptance || loadingInviteCreation,
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
                      gameInitiationType === "create" && game.id === "fm",
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
