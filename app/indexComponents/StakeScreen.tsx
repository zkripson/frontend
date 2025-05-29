import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  KPButton,
  KPDialougue,
  KPInput,
  KPSecondaryLoader,
  KPEasyDeposit,
  KPBalances,
} from "@/components";
import useBalance from "@/hooks/useBalance";
import useSystemFunctions from "@/hooks/useSystemFunctions";
import TOKEN_ADDRESSES from "@/constants/tokenAddresses";
import usePrivyLinkedAccounts from "@/hooks/usePrivyLinkedAccounts";
import useAppActions from "@/store/app/actions";
import useInviteActions from "@/store/invite/actions";
import useWithdrawal from "@/hooks/useWithdrawal";

const schema = z.object({
  stake: z.number().min(1, "Stake is required"),
});

type StakeForm = z.infer<typeof schema>;

interface StakeScreenProps {
  onBack: () => void;
  nextScreen: () => void;
}

const StakeScreen: React.FC<StakeScreenProps> = ({ onBack, nextScreen }) => {
  const { createBettingInvite } = useInviteActions();
  const { checkTokenBalance } = useBalance();
  const { activeWallet } = usePrivyLinkedAccounts();

  const {
    appState,
    inviteState: { loadingInviteCreation },
  } = useSystemFunctions();
  const { showToast } = useAppActions();
  const { approveTransfer } = useWithdrawal();
  const { balances, loadingBalance } = appState;

  const [approvingTransfer, setApprovingTransfer] = useState(false);

  const {
    register: registerStake,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StakeForm>({
    mode: "onSubmit",
    resolver: zodResolver(schema),
    defaultValues: { stake: 1 },
  });

  const stake = watch("stake");
  const usdcBalance =
    balances?.find((token) => token.symbol === "USDC")?.balance || 0;
  const hasInsufficientBalance = Number(stake) > Number(usdcBalance);

  const disableNextButton = loadingBalance || loadingInviteCreation || !stake;

  const handleMinus = () => {
    if (stake > 1) setValue("stake", stake - 1);
  };
  const handlePlus = () => setValue("stake", Number(stake || 0) + 1);

  const onSubmit = async (amount: number) => {
    try {
      if (hasInsufficientBalance) {
        return showToast(
          "Insufficient balance! Please fund your wallet",
          "error"
        );
      }
      setApprovingTransfer(true);
      await approveTransfer();

      setTimeout(() => {
        nextScreen();
        createBettingInvite(amount.toString());
      }, 500);
    } catch (error) {
      showToast("Failed to stake", "error");
    } finally {
      setApprovingTransfer(false);
    }
  };

  useEffect(() => {
    checkTokenBalance(TOKEN_ADDRESSES.USDC);
    checkTokenBalance(TOKEN_ADDRESSES.SHIP);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWallet?.address]);

  useEffect(() => {
    if (errors.stake?.message) {
      showToast(errors.stake.message, "error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errors.stake?.message]);

  return (
    <div className="w-full h-full flex items-center justify-center relative">
      <KPDialougue
        showBackButton
        onBack={onBack}
        primaryCta={{
          title: loadingBalance ? "loading..." : "Next",
          onClick: handleSubmit((data) => onSubmit(data.stake)),
          icon: "arrow",
          iconPosition: "right",
          disabled: disableNextButton || approvingTransfer,
          loading: loadingInviteCreation || approvingTransfer,
        }}
        className="pt-[88px]"
      >
        <div className="flex flex-col gap-6 w-full items-center">
          <h1 className="text-[26px] max-sm:text-[20px] leading-none text-primary-50 font-MachineStd mb-2">
            ENTER STAKE AMOUNT:
          </h1>
          <div className="flex flex-col gap-3 w-full items-center">
            <div className="flex items-center justify-between gap-2 w-full">
              <KPInput
                name="stake"
                placeholder="Stake amount"
                register={registerStake("stake", { valueAsNumber: true })}
                error={!!errors.stake}
                className="flex-1"
                type="number"
                isUSDC
                disabled={approvingTransfer}
              />
              <KPButton
                isMachine
                fullWidth={false}
                title="---"
                onClick={handleMinus}
                className="min-w-8 min-h-8 sm:min-w-[55px] sm:min-h-[52px]"
                disabled={approvingTransfer}
              />
              <KPButton
                isMachine
                fullWidth={false}
                title="+"
                onClick={handlePlus}
                className="min-w-8 min-h-8 sm:min-w-[55px] sm:min-h-[52px]"
                disabled={approvingTransfer}
              />
            </div>

            <p className="text-[12px] text-primary-50 leading-none">
              The higher the stakes, the quicker you level up.
            </p>
          </div>

          <div className="bg-primary-1200 border border-primary-450 border-dashed rounded-2xl w-full py-3 px-4 md:py-6 md:px-10 flex items-center justify-between gap-2 md:gap-5 mt-4 h-[85.6px]">
            {loadingBalance ? (
              <div className="flex-1 flex items-center justify-center">
                <KPSecondaryLoader size={12} />
              </div>
            ) : (
              <>
                <KPBalances />

                <KPEasyDeposit />
              </>
            )}
          </div>
        </div>
      </KPDialougue>
    </div>
  );
};

export default StakeScreen;
