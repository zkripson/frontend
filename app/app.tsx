"use client";

import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import {
  KPFullscreenLoader,
  KPOngoingSessionsNotifier,
  KPToastNotification,
} from "@/components";
import useConnectToFarcaster from "@/hooks/useConnectToFarcaster";
import useSystemFunctions from "@/hooks/useSystemFunctions";
import Image from "next/image";
import { usePlayerActions } from "@/store/player/actions";
import usePrivyLinkedAccounts from "@/hooks/usePrivyLinkedAccounts";
import { sdk } from "@farcaster/frame-sdk";
import { motion, AnimatePresence } from "framer-motion";

export default function RootApp({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const {} = useConnectToFarcaster();
  const { user, ready, authenticated } = usePrivy();
  const {
    navigate,
    playerState: { ongoingSessions },
  } = useSystemFunctions();
  const { getOngoingSessions } = usePlayerActions();
  const { activeWallet } = usePrivyLinkedAccounts();
  const { loginToFarcasterFrame } = useConnectToFarcaster();

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!ready) return;

      if (!user && !authenticated) {
        const isMiniApp = await sdk.isInMiniApp();
        if (isMiniApp) {
          await loginToFarcasterFrame();
        } else {
          await navigate.push("/login");
        }
      }

      setTimeout(() => {
        setIsReady(true);
      }, 1500);
    };

    load();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, ready]);

  // On initial load, fetch ongoing sessions once
  useEffect(() => {
    getOngoingSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWallet?.address]);

  return (
    <>
      {!isReady && (
        <AnimatePresence mode="wait">
          <motion.div
            key="setup"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute bottom-0 right-0 left-0 w-screen z-[9999999]"
          >
            <KPFullscreenLoader title="LOADING..." loaderDuration={6} />
          </motion.div>
        </AnimatePresence>
      )}

      {children}
      <KPToastNotification />
      <KPOngoingSessionsNotifier />
    </>
  );
}
