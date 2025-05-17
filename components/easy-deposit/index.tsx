import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import classNames from "classnames";

import { PlusIcon } from "@/public/icons";
import useAppActions from "@/store/app/actions";
import useFunding from "@/hooks/useFunding";
import KPClickAnimation from "../click-animation";
import KPBackdrop from "../backdrop";
import KPInput from "../input";
import KPButton from "../button";

const depositSchema = z.object({
  deposit: z.number().min(1, "Deposit amount is required"),
});

type DepositForm = z.infer<typeof depositSchema>;

const KPEasyDeposit = ({ isSmall }: { isSmall?: boolean }) => {
  const [depositDropdownOpen, setDepositDropdownOpen] = useState(false);
  const { fundWallet } = useFunding();
  const { showToast } = useAppActions();

  const {
    register: registerDeposit,
    handleSubmit: handleDepositSubmit,
    formState: { errors: depositErrors },
    reset: resetDeposit,
  } = useForm<DepositForm>({
    mode: "onSubmit",
    resolver: zodResolver(depositSchema),
  });

  const handleDeposit = async (data: DepositForm) => {
    try {
      await fundWallet(data.deposit.toString());
      setDepositDropdownOpen(false);
      resetDeposit();
    } catch (error) {
      showToast("Failed to deposit", "error");
    }
  };
  return (
    <div className="relative">
      <KPClickAnimation
        className={classNames(
          "flex items-center gap-2",
          isSmall ? "gap-1" : "gap-2"
        )}
        onClick={() => setDepositDropdownOpen(true)}
      >
        <PlusIcon width={isSmall ? 10 : 14} height={isSmall ? 10 : 14} />
        <span
          className={classNames(
            "text-primary-50 font-bold underline",
            isSmall ? "text-[8px]" : "text-[clamp(10px,5vw,12px)]"
          )}
        >
          Deposit
        </span>
      </KPClickAnimation>

      <AnimatePresence>
        {depositDropdownOpen && (
          <>
            <KPBackdrop onClick={() => setDepositDropdownOpen(false)} />
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
  );
};

export default KPEasyDeposit;
