import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import classNames from "classnames";

import {
  KPClickAnimation,
  KPDialougue,
  KPGameTypeCard,
  KPInput,
  KPProfileBadge,
} from "@/components";
import useInviteActions from "@/store/invite/actions";
import useSystemFunctions from "@/hooks/useSystemFunctions";
import usePrivyLinkedAccounts from "@/hooks/usePrivyLinkedAccounts";
import { BackIcon } from "@/public/icons";
import { useAudio } from "@/providers/AudioProvider";

const schema = z.object({
  code: z.string().min(4, "Code is required"),
});

type NewGame = z.infer<typeof schema>;

const SelectGameScreen = ({
  nextScreen,
  phase,
}: {
  nextScreen: () => void;
  phase: "select" | "stake" | "create";
}) => {
  const {
    inviteState: { loadingInviteAcceptance },
  } = useSystemFunctions();
  const { linkedFarcaster, linkedTwitter } = usePrivyLinkedAccounts();
  const { acceptInvite, createInvite } = useInviteActions();
  const audio = useAudio();

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

  const onSubmit = async () => await acceptInvite(codeValue);

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
      action: () => setJoining(true),
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
  return (
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
                audio.play("place");
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
  );
};

export default SelectGameScreen;
