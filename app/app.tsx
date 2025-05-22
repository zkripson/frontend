"use client";

import { useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { KPOngoingSessionsNotifier, KPToastNotification } from "@/components";
import useConnectToFarcaster from "@/hooks/useConnectToFarcaster";
import useSystemFunctions from "@/hooks/useSystemFunctions";
import Image from "next/image";
import { usePlayerActions } from "@/store/player/actions";

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

  useEffect(() => {
    if (!ready) return;

    if (!user && !authenticated) {
      navigate.push("/login");
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, ready]);

  // On initial load, fetch ongoing sessions once
  useEffect(() => {
    if (ready && authenticated && ongoingSessions.length === 0) {
      getOngoingSessions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, authenticated, ongoingSessions]);

  return (
    <>
      {!ready && (
        <div className="flex flex-col justify-center items-center h-screen bg-primary-250 gap-4 absolute bottom-0 right-0 left-0 w-screen z-[9999999]">
          <Image src="/logo.png" alt="logo" width={112} height={112} priority />

          <h1 className="text-3xl md:text-[42px] leading-none text-primary-50 uppercase font-MachineStd animate-bounce">
            BATTLESHIP
          </h1>
        </div>
      )}

      {children}
      <KPToastNotification />
      <KPOngoingSessionsNotifier />
    </>
  );
}
