"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePrivy } from "@privy-io/react-auth";

import { KPDialougue, KPFullscreenLoader } from "@/components";
import useSystemFunctions from "@/hooks/useSystemFunctions";
import useConnectToFarcaster from "@/hooks/useConnectToFarcaster";

const Social = () => {
  const { user, ready, login } = usePrivy();
  const { loginToFarcasterFrame, isFrameLoaded } = useConnectToFarcaster();
  const { navigate } = useSystemFunctions();

  const [stage, setStage] = useState<"connect" | "setup">("connect");

  const handleLogin = async () => {
    if (isFrameLoaded) {
      return loginToFarcasterFrame();
    }

    return login();
  };

  useEffect(() => {
    if (stage === "setup") {
      const timer = setTimeout(() => {
        navigate.push("/new-game");
      }, 10000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  useEffect(() => {
    if (ready && user) {
      setStage("setup");
    }
  }, [ready, user]);

  return (
    <div className="w-full h-full flex items-center justify-center relative">
      <AnimatePresence mode="wait">
        {stage !== "setup" && (
          <motion.div
            key={stage}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <KPDialougue
              title="connect with your social"
              subtitle="Play with your frens. Share your wins. See who’s already in the fleet."
              showCloseButton
              onClose={() => {}}
              showKripsonImage
              primaryCta={{
                title: "Connect",
                onClick: handleLogin,
                variant: "primary",
                isMachine: true,
                fullWidth: true,
                multipleicons: isFrameLoaded
                  ? ["farcaster"]
                  : ["x", "farcaster"],
              }}
            >
              <div className="w-full flex flex-col items-stretch mt-5 gap-1"></div>
            </KPDialougue>
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
