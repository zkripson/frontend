import {
  SendTransactionModalUIOptions,
  UnsignedTransactionRequest,
  useSendTransaction as useEVMSendTransaction,
} from "@privy-io/react-auth";
import { base } from "viem/chains";
import { parseUnits, toHex } from "viem";
import useAppActions from "@/store/app/actions";

const useWithdrawal = (onClose?: () => void) => {
  const { showToast } = useAppActions();
  const { sendTransaction } = useEVMSendTransaction({
    onSuccess: () => {
      onClose?.();
      showToast("Successfully withdrew to your ETH wallet!", "success");
    },
  });

  const transferTo = async (toAddress: string, amount: number) => {
    const weiBigInt = parseUnits(amount.toString(), 18);
    const valueInHex = toHex(weiBigInt);

    const unsignedTx: UnsignedTransactionRequest = {
      to: toAddress,
      chainId: base.id,
      value: valueInHex,
    };

    const uiOptions: SendTransactionModalUIOptions = {
      description: "Complete your ETH withdrawal",
      buttonText: "Withdraw",
    };

    const { hash } = await sendTransaction(unsignedTx, { uiOptions });
  };

  return {
    transferTo,
  };
};

export default useWithdrawal;
