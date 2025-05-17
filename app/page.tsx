"use client";
import { useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import useSystemFunctions from "@/hooks/useSystemFunctions";

export default function HomePage() {
  const { user, ready, logout } = usePrivy();
  const { navigate } = useSystemFunctions();

  useEffect(() => {
    if (!ready) return;

    if (user) {
      console.log(user);
      navigate.push("/new-game");
    } else {
      navigate.push("/login");
    }
  }, [user, navigate, ready]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-10 h-10 bg-primary-50 rounded-full animate-pulse" />
    </div>
  );
}
