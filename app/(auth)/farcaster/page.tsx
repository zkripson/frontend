"use client";

import { useState, useEffect, JSX } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

import useCopy from "@/hooks/useCopy";
import { KPDialougue, KPFullscreenLoader, KPLoader } from "@/components";
import { CheckIcon } from "@/public/icons";

const friends = [
  { name: "Kripson", image: "/images/kripson.jpeg" },
  { name: "Kripson", image: "/images/kripson.jpeg" },
  { name: "Kripson", image: "/images/kripson.jpeg" },
];

const Farcaster = () => {
  const router = useRouter();
  const { handleCopy } = useCopy();

  const [stage, setStage] = useState<"connect" | "qr" | "connected" | "setup">(
    "connect"
  );
  const [showSpinner, setShowSpinner] = useState(false);

  const connectFarcaster = () => {
    setShowSpinner(true);

    setTimeout(() => {
      setShowSpinner(false);
      setStage("qr");
    }, 3000);
  };

  useEffect(() => {
    if (stage === "qr") {
      const timer = setTimeout(() => {
        setStage("connected");
      }, 7000); // ⬅️ Longer, more realistic
      return () => clearTimeout(timer);
    }

    if (stage === "connected") {
      const timer = setTimeout(() => {
        setStage("setup");
      }, 6000); // ⬅️ Longer
      return () => clearTimeout(timer);
    }

    if (stage === "setup") {
      const timer = setTimeout(() => {
        router.push("/new-game");
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [stage, router]);

  const dialogues: Record<string, JSX.Element> = {
    connect: (
      <KPDialougue
        title="connect with farcaster"
        subtitle="Play with your frens. Share your wins. See who’s already in the fleet."
        showCloseButton
        onClose={() => {}}
        showKripsonImage
        primaryCta={{
          title: "Connect with Farcaster",
          onClick: connectFarcaster,
          icon: "farcaster",
        }}
      >
        <div className="text-center self-stretch w-full mt-[30%]">
          <span className="text-[16px] leading-[16px] text-primary-50">
            Skip for now
          </span>
        </div>
      </KPDialougue>
    ),

    qr: (
      <KPDialougue
        title="sign in with farcaster"
        subtitle="Play with your frens. Share your wins. See who’s already in the fleet."
        showCloseButton
        showBackButton
        onClose={() => {}}
        primaryCta={{
          title: "Copy link",
          onClick: () => handleCopy("https://farcaster.xyz"),
          icon: "copy",
        }}
      >
        <div className="flex flex-col items-center justify-center self-stretch w-full gap-5 text-center">
          <Image
            src="/images/dummy-qr-code.png"
            alt="QR Code"
            width={283}
            height={283}
            className="w-[283px] h-[283px] rounded-lg"
            quality={100}
          />
          <p className="text-[16px] leading-[16px] text-primary-50">
            Or copy this link and paste it into a phone browser to open the
            Warpcast phone.
          </p>
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
          <div className="size-[84px] rounded-lg bg-white flex items-center justify-center relative">
            <Image
              src="/images/farcaster.png"
              alt="farcaster"
              width={64}
              height={64}
              quality={100}
              className="size-16 object-cover rounded-md"
            />
            <div className="absolute right-1 bottom-4">
              <CheckIcon />
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
                  className="w-[32px] h-[32px] rounded-full border-2 border-white"
                  quality={100}
                  style={{ zIndex: friends.length - index }}
                />
              ))}
            </div>

            <span className="text-[16px] leading-[16px] text-primary-50">
              {friends.length} friends already playing!
            </span>
          </div>
        </div>
      </KPDialougue>
    ),
  };

  return (
    <div className="flex items-center justify-center flex-1 pt-16 relative">
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
          >
            <KPFullscreenLoader title="SETTING UP GAME PROFILE..." />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Farcaster;
