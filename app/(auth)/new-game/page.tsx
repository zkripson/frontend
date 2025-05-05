"use client";
import { useState, JSX } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";

import {
  KPDialougue,
  KPGameTypeCard,
  KPInput,
  KPProfileBadge,
} from "@/components";
import useSystemFunctions from "@/hooks/useSystemFunctions";
import SelectGrid from "./selectGrid";

const schema = z.object({
  code: z.string().min(4, "Code is required"),
});

type NewGame = z.infer<typeof schema>;

const gridSizes = ["10x10", "9x9", "8x8"];
const battlefields = [1, 2, 3];
const dummySessionID = "A1B2C3D4E5F6G7H8I9J0";

const NewGame = () => {
  const [step, setStep] = useState<NewGameStep>("chooseGame");
  const [selectedGridSize, setSelectedGridSize] = useState<string | null>(null);
  const [selectedBattlefield, setSelectedBattlefield] = useState<number | null>(
    null
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewGame>({
    mode: "onSubmit",
    resolver: zodResolver(schema),
  });

  const { navigate } = useSystemFunctions();

  const gameTypes: GameType[] = [
    {
      id: "fm",
      name: "Friend's Match",
      description: "Invite from Farcaster or Email",
      action: () => {},
    },
    {
      id: "qm",
      name: "Quick Match",
      description: "Get matched with random players",
      status: "coming soon",
    },
  ];

  const onSubmit = (data: NewGame) => {
    console.log("Joining match with code:", data.code);

    // Eventually navigate to the game screen with the code after other logic
    navigate.push(`${dummySessionID}`);
  };

  const startGame = () => {
    console.log("Starting game with:", {
      selectedGridSize,
      selectedBattlefield,
    });

    // Eventually navigate to the game screen with the code after other logic
    navigate.push(`${dummySessionID}`);
  };

  const screens: Record<NewGameStep, JSX.Element> = {
    chooseGame: (
      <KPDialougue
        title="welcome"
        showCloseButton
        onClose={() => {}}
        primaryCta={{
          title: "Next",
          onClick: () => handleSubmit(onSubmit)(),
          icon: "arrow",
          iconPosition: "right",
        }}
        className="pt-[88px]"
      >
        <div className="flex flex-col items-center gap-16 max-sm:gap-7 self-stretch w-full">
          <KPProfileBadge username="Dazeign" />

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
                <KPGameTypeCard {...game} />
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
