"use client";
import { useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import useSystemFunctions from "@/hooks/useSystemFunctions";

export default function HomePage() {
  const { user, ready, login } = usePrivy();
  const { navigate } = useSystemFunctions();

  useEffect(() => {
    login();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ready) return;

    console.log("USER:", user);

    if (user) {
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
