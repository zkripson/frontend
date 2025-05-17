import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import classNames from "classnames";
import { motion, AnimatePresence } from "framer-motion";

import {
  KPButton,
  KPClickAnimation,
  KPDialougue,
  KPInput,
  KPSecondaryLoader,
  KPBackdrop,
} from "@/components";
import useBalance from "@/hooks/useBalance";
import useSystemFunctions from "@/hooks/useSystemFunctions";
import TOKEN_ADDRESSES from "@/constants/tokenAddresses";
import usePrivyLinkedAccounts from "@/hooks/usePrivyLinkedAccounts";
import { PlusIcon } from "@/public/icons";
import useAppActions from "@/store/app/actions";
import useFunding from "@/hooks/useFunding";
import useInviteActions from "@/store/invite/actions";
import useWithdrawal from "@/hooks/useWithdrawal";

const schema = z.object({
  stake: z.number().min(1, "Stake is required"),
});

const depositSchema = z.object({
  deposit: z.number().min(1, "Deposit amount is required"),
});

type StakeForm = z.infer<typeof schema>;
type DepositForm = z.infer<typeof depositSchema>;

interface StakeScreenProps {
  onBack: () => void;
  nextScreen: () => void;
}

const StakeScreen: React.FC<StakeScreenProps> = ({ onBack, nextScreen }) => {
  const { createBettingInvite } = useInviteActions();
  const { checkTokenBalance } = useBalance();
  const { evmWallet } = usePrivyLinkedAccounts();
  const {
    appState,
    inviteState: { loadingInviteCreation },
  } = useSystemFunctions();
  const { showToast } = useAppActions();
  const { fundWallet } = useFunding();
  const { approveTransfer } = useWithdrawal();
  const { balances, loadingBalance } = appState;
  const [depositDropdownOpen, setDepositDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const {
    register: registerDeposit,
    handleSubmit: handleDepositSubmit,
    formState: { errors: depositErrors },
    reset: resetDeposit,
  } = useForm<DepositForm>({
    mode: "onSubmit",
    resolver: zodResolver(depositSchema),
  });

  const stake = watch("stake");
  const usdcBalance =
    balances?.find((token) => token.symbol === "USDC")?.balance || 0;
  const hasInsufficientBalance = Number(stake) > Number(usdcBalance);

  const disableNextButton =
    loadingBalance || loadingInviteCreation || !stake || hasInsufficientBalance;

  const handleMinus = () => {
    if (stake > 1) setValue("stake", stake - 1);
  };
  const handlePlus = () => setValue("stake", Number(stake || 0) + 1);

  const handleDeposit = async (data: DepositForm) => {
    try {
      await fundWallet(data.deposit.toString());
      setDepositDropdownOpen(false);
      resetDeposit();
    } catch (error) {
      showToast("Failed to deposit", "error");
    }
  };

  const onSubmit = async (amount: number) => {
    try {
      setLoading(true);
      await approveTransfer(amount);

      setTimeout(() => {
        nextScreen();
        createBettingInvite(amount.toString());
      }, 1500);
    } catch (error) {
      showToast("Failed to stake", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkTokenBalance(TOKEN_ADDRESSES.USDC);
    checkTokenBalance(TOKEN_ADDRESSES.SHIP);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evmWallet]);

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
          disabled: disableNextButton,
          loading: loading,
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
              />
              <KPButton
                isMachine
                fullWidth={false}
                title="---"
                onClick={handleMinus}
                className="min-w-8 min-h-8 sm:min-w-[55px] sm:min-h-[52px]"
              />
              <KPButton
                isMachine
                fullWidth={false}
                title="+"
                onClick={handlePlus}
                className="min-w-8 min-h-8 sm:min-w-[55px] sm:min-h-[52px]"
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
                {balances?.map((token) => (
                  <div
                    key={token.address}
                    className={classNames(
                      "flex flex-col gap-0",
                      "text-white items-start"
                    )}
                  >
                    <span className="text-[clamp(20px,5vw,26px)] font-MachineStd font-bold">
                      $
                      {Number(token.balance).toLocaleString("en-US", {
                        maximumFractionDigits: 2,
                        minimumFractionDigits: 2,
                      })}
                    </span>
                    <span className="text-[clamp(10px,5vw,12px)] flex items-center gap-1">
                      {token.symbol.toLowerCase() === "usdt" && (
                        <Image
                          src="/images/usdt.png"
                          alt="usdt"
                          width={18}
                          height={18}
                          quality={100}
                          className="size-[18px] object-cover"
                        />
                      )}
                      {token.symbol}
                    </span>
                  </div>
                ))}

                <div className="relative">
                  <KPClickAnimation
                    className="flex items-center gap-2"
                    onClick={() => setDepositDropdownOpen(true)}
                  >
                    <PlusIcon />
                    <span className="text-[clamp(10px,5vw,12px)] text-primary-50 font-bold underline">
                      Deposit
                    </span>
                  </KPClickAnimation>

                  <AnimatePresence>
                    {depositDropdownOpen && (
                      <>
                        <KPBackdrop
                          onClick={() => setDepositDropdownOpen(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 8 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.22, ease: "easeInOut" }}
                          className="absolute right-0 top-full mt-2 w-[200px] z-50"
                        >
                          <div className="bg-primary-450/25 backdrop-blur-sm rounded p-2 border border-primary-50 shadow-lg">
                            <form
                              onSubmit={handleDepositSubmit(handleDeposit)}
                              className="flex flex-col gap-2"
                            >
                              <KPInput
                                name="deposit"
                                placeholder="Amount"
                                register={registerDeposit("deposit", {
                                  valueAsNumber: true,
                                })}
                                error={!!depositErrors.deposit}
                                type="number"
                                isUSDC
                              />
                              <KPButton
                                isMachine
                                title="Deposit"
                                type="submit"
                                small
                                fullWidth
                              />
                            </form>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>
        </div>
      </KPDialougue>
    </div>
  );
};

export default StakeScreen;
