"use client";
import { useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { user, ready, login } = usePrivy();
  const navigate = useRouter();

  login();

  useEffect(() => {
    if (!ready) return;

    console.log("USER:", user);

    if (user) return navigate.push("/new-game");

    return navigate.push("/login");
  }, [user, navigate, ready]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-10 h-10 bg-primary-50 rounded-full animate-pulse" />
    </div>
  );
}
