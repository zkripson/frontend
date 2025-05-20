"use client";
import { useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import useSystemFunctions from "@/hooks/useSystemFunctions";
import Image from "next/image";

export default function HomePage() {
  const { user, ready } = usePrivy();
  const { navigate } = useSystemFunctions();

  useEffect(() => {
    if (!ready) return;

    if (user) {
      navigate.push("/new-game");
    } else {
      navigate.push("/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, ready]);

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-primary-250 gap-4">
      <Image src="/logo.png" alt="logo" width={112} height={112} priority />

      <h1 className="text-3xl md:text-[42px] leading-none text-primary-50 uppercase font-MachineStd animate-bounce">
        BATTLESHIP
      </h1>
    </div>
  );
}
