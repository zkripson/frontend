"use client";

import { useEffect } from "react";
import Image from "next/image";
import { usePrivy } from "@privy-io/react-auth";
import { KPToastNotification } from "@/components";
import useConnectToFarcaster from "@/hooks/useConnectToFarcaster";
import useSystemFunctions from "@/hooks/useSystemFunctions";

export default function RootApp({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const {} = useConnectToFarcaster();
  const { user, ready, authenticated } = usePrivy();
  const { navigate } = useSystemFunctions();

  useEffect(() => {
    if (!ready) return;

    if (!user && !authenticated) {
      navigate.push("/login");
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, ready]);

  if (!ready) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-primary-250 gap-4">
        <Image src="/logo.png" alt="logo" width={112} height={112} priority />

        <h1 className="text-3xl md:text-[42px] leading-none text-primary-50 uppercase font-MachineStd animate-bounce">
          BATTLESHIP
        </h1>
      </div>
    );
  }

  return (
    <>
      {children}
      <KPToastNotification />
    </>
  );
}
