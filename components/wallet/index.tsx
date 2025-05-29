import { useEffect, useState, Suspense, useMemo } from "react";
import Image from "next/image";
import classNames from "classnames";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  KPButton,
  KPDialougue,
  KPInput,
  KPSecondaryLoader,
} from "@/components";
import useSystemFunctions from "@/hooks/useSystemFunctions";
import { RadioIcon } from "@/public/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import useFunding from "@/hooks/useFunding";
import useWithdrawal from "@/hooks/useWithdrawal";
import useAppActions from "@/store/app/actions";
import useAddressValidator from "@/hooks/useAddressValidator";
import useBalance from "@/hooks/useBalance";
import TOKEN_ADDRESSES from "@/constants/tokenAddresses";
import usePrivyLinkedAccounts from "@/hooks/usePrivyLinkedAccounts";

const schema = z.object({
  amount: z.number().min(1, "Amount is required"),
  toAddress: z.string().optional(),
});

type AmountForm = z.infer<typeof schema>;

const WalletComponent = ({ isDeposit = false }: { isDeposit?: boolean }) => {
  const { activeWallet } = usePrivyLinkedAccounts();
  const { checkTokenBalance } = useBalance();
  const { appState, navigate } = useSystemFunctions();
  const { fundWallet } = useFunding();
  const { transferToken } = useWithdrawal();
  const { showToast } = useAppActions();

  const { balances, loadingBalance } = appState;

  const [selectedToken, setSelectedToken] = useState<Balance | null>(
    balances[0]
  );
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AmountForm>({
    mode: "onSubmit",
    resolver: zodResolver(schema),
  });

  const { isAddressValid } = useAddressValidator(watch("toAddress") || "");

  const balance = useMemo(() => {
    return Number(selectedToken?.balance || 0).toLocaleString("en-US", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    });
  }, [selectedToken]);

  const handleSelectToken = (address: `0x${string}`) => {
    const token = balances.find((token) => token.address === address);
    if (token) {
      setSelectedToken(token);
    }
  };

  const amount = watch("amount");

  const handleMinus = () => {
    if (amount > 0) {
      setValue("amount", amount - 1);
    }
  };

  const handlePlus = () => {
    setValue("amount", Number(amount || 0) + 1);
  };

  const onSubmit = (data: AmountForm) => {
    if (!data.amount) return;

    if (isDeposit) {
      fundWallet(data.amount.toString());
    } else {
      if (!data.toAddress || !isAddressValid) {
        return showToast("Please enter a valid address", "error");
      }

      if (data.amount > Number(balance)) {
        return showToast("Insufficient balance", "error");
      }

      const isUsdc = selectedToken?.address === TOKEN_ADDRESSES.USDC;

      transferToken(
        data.toAddress! as `0x${string}`,
        data.amount,
        isUsdc ? "USDC" : "SHIP"
      );
    }
  };

  useEffect(() => {
    if (balances.length > 0) {
      setSelectedToken(balances[0]);
    }
  }, [balances]);

  useEffect(() => {
    if (selectedToken) {
      setValue("amount", 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedToken]);

  useEffect(() => {
    checkTokenBalance(TOKEN_ADDRESSES.USDC);

    if (!isDeposit) {
      checkTokenBalance(TOKEN_ADDRESSES.SHIP);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWallet]);

  return (
    <div className="w-full h-full flex items-center justify-center relative">
      <KPDialougue
        showBackButton
        onBack={() => navigate.back()}
        primaryCta={{
          title: "NEXT",
          onClick: handleSubmit(onSubmit),
          icon: "arrow",
          iconPosition: "right",
          disabled: !amount,
        }}
        className="pt-[88px]"
      >
        <div>
          <h1 className="text-[26px] max-sm:text-[20px] leading-none text-primary-50 font-MachineStd">
            {`${isDeposit ? "DEPOSIT" : "WITHDRAW"} FUNDS`}
          </h1>

          <div className="py-10 flex justify-between items-center gap-2">
            <div className="flex flex-col gap-2">
              {balances?.map((token, index) => (
                <div
                  key={index}
                  className={classNames(
                    "flex items-center gap-3 cursor-pointer",
                    {
                      hidden: isDeposit && token.symbol !== "USDC",
                    }
                  )}
                  onClick={() => handleSelectToken(token.address)}
                >
                  <div
                    role="radio"
                    aria-checked={selectedToken?.address === token.address}
                    className="w-4 h-4 lg:w-5 lg:h-5 rounded-full border border-primary-450 flex justify-center items-center"
                  >
                    {selectedToken?.address === token.address && (
                      <div>
                        <div className="hidden lg:block">
                          <RadioIcon />
                        </div>
                        <div className="block lg:hidden">
                          <RadioIcon size={10} />
                        </div>
                      </div>
                    )}
                  </div>

                  <p className="text-[10px] lg:text-xs font-medium">
                    {token.symbol}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-primary-1200 border border-primary-450 border-dashed rounded-2xl w-[70%] md:w-[65%] py-3 px-4 md:py-6 md:px-10 flex items-center justify-center gap-2 md:gap-5 text-primary-50">
              <h5 className="text-[10px] md:text-xs font-medium text-nowrap">
                Available Balance
              </h5>

              <div className="flex flex-col items-start md:w-[65%]">
                {loadingBalance ? (
                  <div className="mb-2">
                    <KPSecondaryLoader size={12} />
                  </div>
                ) : (
                  <p className="text-xl md:text-3xl font-bold text-white font-MachineStd text-wrap">
                    ${balance}
                  </p>
                )}
                <div className="flex items-center gap-1 md:gap-3">
                  <Image
                    src="/images/usdc-logo.webp"
                    alt={selectedToken?.symbol || "token"}
                    width={18}
                    height={18}
                    className="w-[18px] h-[18px] md:w-[22px] md:h-[22px]"
                  />
                  <p className="text-[10px] md:text-xs font-medium">
                    {selectedToken?.symbol}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <KPInput
              name="amount"
              placeholder={`Enter amount to ${
                isDeposit ? "deposit" : "withdraw"
              }`}
              register={register("amount")}
              error={!!errors.amount}
              className="w-full"
              type="number"
            />
            <KPButton
              isMachine
              fullWidth={false}
              title="---"
              onClick={handleMinus}
              className="w-[55px] h-[52px]"
            />
            <KPButton
              isMachine
              fullWidth={false}
              title="+"
              onClick={handlePlus}
              className="w-[55px] h-[52px]"
            />
          </div>

          {!isDeposit && (
            <div className="mt-5">
              <KPInput
                name="toAddress"
                placeholder="Paste recipient address"
                register={register("toAddress")}
                error={!!errors.toAddress}
                className="w-full"
              />
            </div>
          )}
        </div>
      </KPDialougue>
    </div>
  );
};

const WalletScreen = ({ isDeposit = false }: { isDeposit?: boolean }) => (
  <Suspense fallback={<div>Loading...</div>}>
    <WalletComponent isDeposit={isDeposit} />
  </Suspense>
);

export default WalletScreen;
