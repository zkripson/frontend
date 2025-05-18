"use client";
import { useEffect } from "react";
import { useCreateWallet, usePrivy } from "@privy-io/react-auth";
import useSystemFunctions from "@/hooks/useSystemFunctions";

export default function HomePage() {
  const { user, ready } = usePrivy();
  const { navigate } = useSystemFunctions();

  useEffect(() => {
    if (!ready) return;

    console.log("user", user);
    if (user) {
      navigate.push("/new-game");
    } else {
      navigate.push("/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, ready]);

  return (
    <div className="flex justify-center items-center h-screen bg-primary-250 w-full">
      <div className="w-10 h-10 bg-primary-50 rounded-full animate-pulse ml-10" />
    </div>
  );
}
