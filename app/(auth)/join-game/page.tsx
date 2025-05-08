"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { KPDialougue } from "@/components";
import useInviteActions from "@/store/invite/actions";
import useSystemFunctions from "@/hooks/useSystemFunctions";

const JoinGameComponent = () => {
  const searchParams = useSearchParams();
  const { acceptInvite } = useInviteActions();
  const {
    inviteState: { loadingInviteAcceptance },
  } = useSystemFunctions();
  const [error, setError] = useState<string | null>(null);

  const code = searchParams.get("code");

  useEffect(() => {
    if (code) {
      const joinGame = async () => {
        try {
          await acceptInvite(code as string);
          console.log("accepting");
        } catch (err) {
          setError("Failed to join the game. Please try again later.");
        }
      };
      joinGame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  return (
    <div className="w-full h-full flex items-center justify-center relative">
      <KPDialougue
        title="Join Game"
        showCloseButton={false}
        primaryCta={{
          title: loadingInviteAcceptance ? "Joining..." : "Try Again",
          onClick: () => window.location.reload(),
          icon: "arrow",
          iconPosition: "right",
          loading: loadingInviteAcceptance,
          disabled: loadingInviteAcceptance,
        }}
        className="pt-[88px]"
      >
        <div className="flex flex-col items-center gap-16 max-sm:gap-7 self-stretch w-full">
          <h1 className="text-[26px] max-sm:text-[20px] leading-none text-primary-50 font-MachineStd">
            {error ? error : "Joining the game..."}
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
