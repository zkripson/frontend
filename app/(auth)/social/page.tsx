"use client";

import { useState, useEffect, JSX } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useLinkAccount } from "@privy-io/react-auth";

import {
  KPButton,
  KPDialougue,
  KPFullscreenLoader,
  KPLoader,
} from "@/components";
import { CheckIcon } from "@/public/icons";
import useSystemFunctions from "@/hooks/useSystemFunctions";

const friends = [
  { name: "Kripson", image: "/images/kripson.jpeg" },
  { name: "Kripson", image: "/images/kripson.jpeg" },
  { name: "Kripson", image: "/images/kripson.jpeg" },
];

const Social = () => {
  const { linkTwitter, linkFarcaster } = useLinkAccount({
    onSuccess: () => {
      setShowSpinner(false);
      setStage("connected");
    },
    onError: (error) => {
      console.error("LINK FARCaster ERROR:", error);
      setShowSpinner(false);
    },
  });
  const { navigate } = useSystemFunctions();

  const [stage, setStage] = useState<"connect" | "connected" | "setup">(
    "connect"
  );
  const [showSpinner, setShowSpinner] = useState(false);

  const connectionOptions: Array<IKPButton> = [
    {
      title: "Connect with farcaster",
      icon: "farcaster",
      onClick: linkFarcaster,
    },
    {
      title: "Connect with twitter",
      icon: "x",
      onClick: linkTwitter,
    },
  ];

  useEffect(() => {
    if (stage === "connected") {
      const timer = setTimeout(() => {
        setStage("setup");
      }, 6000);
      return () => clearTimeout(timer);
    }

    if (stage === "setup") {
      const timer = setTimeout(() => {
        navigate.push("/new-game");
      }, 10000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  const dialogues: Record<string, JSX.Element> = {
    connect: (
      <KPDialougue
        title="connect your socials"
        subtitle="Play with your frens. Share your wins. See who’s already in the fleet."
        showCloseButton
        onClose={() => {}}
        showKripsonImage
        primaryCta={{
          title: "skip for now",
          onClick: () => setStage("setup"),
          variant: "tertiary",
        }}
      >
        <div className="w-full flex flex-col items-stretch mt-5 gap-1">
          {connectionOptions.map((option, index) => (
            <KPButton
              key={index}
              {...option}
              variant="primary"
              isMachine
              fullWidth
            />
          ))}
        </div>
      </KPDialougue>
    ),

    connected: (
      <KPDialougue
        title="connect with farcaster"
        subtitle="Play with your frens. Share your wins. See who’s already in the fleet."
        showCloseButton
        showBackButton
        onClose={() => {}}
        ctaText="Farcaster Connected"
      >
        <div className="flex flex-col items-center justify-center self-stretch w-full gap-5 text-center">
          <div className="size-[84px] max-sm:size-[56.14px] rounded-lg bg-white flex items-center justify-center relative">
            <Image
              src="/images/farcaster.png"
              alt="farcaster"
              width={64}
              height={64}
              quality={100}
              className="size-16 max-sm:size-[42.78px] object-cover rounded-md"
            />
            <div className="absolute right-1 bottom-4 max-sm:bottom-2">
              <CheckIcon className="max-sm:size-[17.38px]" />
            </div>
          </div>

          <div className="flex items-center justify-center gap-2">
            <div className="flex items-center justify-center -space-x-2">
              {friends.map((friend, index) => (
                <Image
                  key={index}
                  src={friend.image}
                  alt={friend.name}
                  width={32}
                  height={32}
                  className="size-[32px] max-sm:size-[21.39px] rounded-full border-2 max-sm:border border-white"
                  quality={100}
                  style={{ zIndex: friends.length - index }}
                />
              ))}
            </div>

            <span className="text-[16px] leading-[100%] max-sm:text-[10.69px] text-primary-50">
              {friends.length} friends already playing!
            </span>
          </div>
        </div>
      </KPDialougue>
    ),
  };

  return (
    <div className="w-full h-full flex items-center justify-center relative">
      <AnimatePresence>
        {showSpinner && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <KPLoader variant="large" color="#44190c" />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {stage !== "setup" && (
          <motion.div
            key={stage}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {dialogues[stage]}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {stage === "setup" && (
          <motion.div
            key="setup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className=""
          >
            <KPFullscreenLoader title="SETTING UP GAME PROFILE..." />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Social;
