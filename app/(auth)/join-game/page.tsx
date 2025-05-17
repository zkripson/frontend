"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { KPDialougue } from "@/components";
import useInviteActions from "@/store/invite/actions";
import useSystemFunctions from "@/hooks/useSystemFunctions";
import { usePrivy } from "@privy-io/react-auth";

const JoinGameComponent = () => {
  const { user, ready } = usePrivy();
  const searchParams = useSearchParams();
  const { acceptInvite } = useInviteActions();
  const {
    inviteState: { loadingInviteAcceptance },
    navigate,
  } = useSystemFunctions();
  const [error, setError] = useState<string | null>(null);
  const [inviteAccepted, setInviteAccepted] = useState(false);

  const code = searchParams.get("code");

  const handleAcceptInvite = async () => {
    if (!code) return;
    try {
      await acceptInvite(code as string);
      setInviteAccepted(true);
    } catch (err) {
      setError("Failed to join the game. Please try again later.");
    }
  };

  useEffect(() => {
    if (!ready) return;

    if (!user && code) {
      sessionStorage.setItem("redirectToJoin", code);
      navigate.push("/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, ready, code]);

  if (!ready) return;

  return (
    <div className="w-full h-full flex items-center justify-center relative">
      <KPDialougue
        title="Join Game"
        showCloseButton={false}
        primaryCta={{
          title: loadingInviteAcceptance
            ? "Joining..."
            : inviteAccepted
            ? "Joined!"
            : "Accept Invite",
          onClick: handleAcceptInvite,
          icon: "arrow",
          iconPosition: "right",
          loading: loadingInviteAcceptance,
          disabled: loadingInviteAcceptance || inviteAccepted,
        }}
        className="pt-[88px]"
      >
        <div className="flex flex-col items-center gap-16 max-sm:gap-7 self-stretch w-full">
          <h1 className="text-[26px] max-sm:text-[20px] leading-none text-primary-50 font-MachineStd">
            {error
              ? error
              : inviteAccepted
              ? "Successfully joined the game!"
              : "Click below to join the game."}
          </h1>

          {code && !error && (
            <p className="font-bold text-[20px] text-center">{code}</p>
          )}
        </div>
      </KPDialougue>
    </div>
  );
};

const JoinGame = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <JoinGameComponent />
  </Suspense>
);

export default JoinGame;
