"use client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";

import TOKEN_ADDRESSES from "@/constants/tokenAddresses";
import {
  KPClickAnimation,
  KPInput,
  KPGameDetails,
  KPBalances,
  KPEasyDeposit,
  KPSecondaryLoader,
} from "@/components";
import { BackIcon } from "@/public/icons";
import useInviteActions from "@/store/invite/actions";
import useSystemFunctions from "@/hooks/useSystemFunctions";
import useBalance from "@/hooks/useBalance";
import usePrivyLinkedAccounts from "@/hooks/usePrivyLinkedAccounts";
import useAppActions from "@/store/app/actions";

const schema = z.object({
  code: z
    .string()
    .min(1, "Code is required")
    .regex(/^[A-Z0-9]{3}-[A-Z0-9]{3}-[A-Z0-9]{2,3}$/, "Invalid code format"),
});

const KPGameCodeInput = ({
  onBack,
  setCanAccept,
  setCode,
}: IKPGameCodeInput) => {
  const {
    inviteState: { invitation, invitationLoading, loadingInviteAcceptance },
    appState,
  } = useSystemFunctions();
  const { getInvitation } = useInviteActions();
  const { checkTokenBalance } = useBalance();
  const { activeWallet } = usePrivyLinkedAccounts();
  const { showToast } = useAppActions();

  const {
    register,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const { balances } = appState;
  const code = watch("code");

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
    if (activeWallet) {
      checkTokenBalance(TOKEN_ADDRESSES.USDC);
      checkTokenBalance(TOKEN_ADDRESSES.SHIP);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWallet?.address]);

  useEffect(() => {
    const fetchInvite = async () => {
      if (!code || !schema.safeParse({ code }).success) return;

      setCode?.(code);
      await getInvitation(code);
    };

    const timer = setTimeout(fetchInvite, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="relative w-full">
        <div className="absolute h-full top-0 left-0">
          <KPClickAnimation onClick={onBack}>
            <BackIcon width={25} height={18} />
          </KPClickAnimation>
        </div>
        <h1 className="text-[26px] max-sm:text-[20px] leading-none text-primary-50 font-MachineStd">
          Join match:
        </h1>
      </div>

      <KPInput
        name="code"
        placeholder="Enter invite code (e.g. NJ5-YNJ-5Y)"
        register={register("code", {
          setValueAs: (value) => value?.toUpperCase(),
        })}
        error={!!errors.code}
        className="w-full"
        type="text"
        disabled={invitationLoading || loadingInviteAcceptance}
      />

      <AnimatePresence>
        {invitationLoading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex justify-center py-4"
          >
            <KPSecondaryLoader size={12} />
          </motion.div>
        )}

        {invitation && !invitationLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25 }}
            className="flex flex-col gap-4 w-full"
          >
            <h1 className="text-[26px] max-sm:text-[20px] leading-none text-primary-50 font-MachineStd -mb-2">
              Game Details:
            </h1>

            <KPGameDetails invitation={invitation} isSmall />

            <div className="flex items-center justify-between gap-2 w-full bg-primary-1200 border border-primary-450 border-dashed rounded-2xl p-3 md:p-4 lg:p-6">
              <KPBalances isSmall />
              <KPEasyDeposit isSmall />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KPGameCodeInput;
