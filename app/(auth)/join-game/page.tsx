"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";

import TOKEN_ADDRESSES from "@/constants/tokenAddresses";
import {
  KPBalances,
  KPDialougue,
  KPEasyDeposit,
  KPGameDetails,
  KPSecondaryLoader,
} from "@/components";
import usePrivyLinkedAccounts from "@/hooks/usePrivyLinkedAccounts";
import useInviteActions from "@/store/invite/actions";
import useSystemFunctions from "@/hooks/useSystemFunctions";
import useBalance from "@/hooks/useBalance";
import useAppActions from "@/store/app/actions";
import useWithdrawal from "@/hooks/useWithdrawal";

const JoinGameComponent = () => {
  const { user, ready } = usePrivy();
  const searchParams = useSearchParams();
  const { getInvitation, acceptBettingInvite } = useInviteActions();
  const { showToast } = useAppActions();
  const { checkTokenBalance } = useBalance();
  const { activeWallet } = usePrivyLinkedAccounts();
  const { approveTransfer } = useWithdrawal();

  const {
    inviteState: { loadingInviteAcceptance, invitation, invitationLoading },
    navigate,
    appState: { balances },
  } = useSystemFunctions();
  const [error, setError] = useState<string | null>(null);
  const [canAccept, setCanAccept] = useState(false);

  const code = searchParams.get("code");

  const handleAcceptInvite = async () => {
    if (!code || !invitation?.stakeAmount) return;

    try {
      await approveTransfer(Number(invitation?.stakeAmount));
      await acceptBettingInvite(code);
    } catch (err) {
      setError("Failed to join the game. Please try again later.");
    }
  };

  const usdcBalance = Number(
    balances?.find((token) => token.symbol === "USDC")?.balance || 0
  );

  useEffect(() => {
    if (invitation && invitation.stakeAmount) {
      const stakeAmountNum = Number(invitation.stakeAmount);
      const hasBalance = usdcBalance >= stakeAmountNum;
      setCanAccept?.(hasBalance);

      if (!hasBalance) {
        showToast(
          `Required stake amount: ${invitation.stakeAmount} USDC`,
          "error"
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invitation, usdcBalance]);

  useEffect(() => {
    if (code && ready && user) {
      getInvitation(code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, ready, user]);

  useEffect(() => {
    if (!ready) return;

    if (!user && code) {
      sessionStorage.setItem("redirectToJoin", code);
      navigate.push("/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, ready, code]);

  useEffect(() => {
    checkTokenBalance(TOKEN_ADDRESSES.USDC);
    checkTokenBalance(TOKEN_ADDRESSES.SHIP);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWallet?.address]);

  if (!ready) return;

  return (
    <div className="w-full h-full flex items-center justify-center relative">
      <KPDialougue
        title="Join Game"
        showCloseButton={false}
        primaryCta={{
          title: loadingInviteAcceptance ? "Joining..." : "Accept Invite",
          onClick: handleAcceptInvite,
          icon: "arrow",
          iconPosition: "right",
          loading: loadingInviteAcceptance || invitationLoading,
          disabled: loadingInviteAcceptance || !canAccept,
        }}
      >
        <div className="flex flex-col items-center gap-3 self-stretch w-full mt-5">
          {invitationLoading ? (
            <KPSecondaryLoader />
          ) : error ? (
            <h1 className="text-[26px] max-sm:text-[20px] leading-none text-primary-50 font-MachineStd">
              {error}
            </h1>
          ) : invitation ? (
            <>
              <div className="flex flex-col gap-4 items-center">
                <h1 className="text-[26px] max-sm:text-[20px] leading-none text-primary-50 font-MachineStd">
                  Game Details:
                </h1>
              </div>
              <KPGameDetails invitation={invitation} />

              <div className="flex items-center justify-between gap-2 w-full bg-primary-1200 border border-primary-450 border-dashed rounded-2xl p-3 md:p-4 lg:p-6">
                <KPBalances />
                <KPEasyDeposit />
              </div>
            </>
          ) : (
            <h1 className="text-[26px] max-sm:text-[20px] leading-none text-primary-50 font-MachineStd">
              Click below to join the game.
            </h1>
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
