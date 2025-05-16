import {
  SendTransactionModalUIOptions,
  UnsignedTransactionRequest,
  useSendTransaction,
} from "@privy-io/react-auth";
import { base } from "viem/chains";
import {
  parseUnits,
  toHex,
  encodeFunctionData,
  type Address,
  erc20Abi,
} from "viem";
import useAppActions from "@/store/app/actions";
import TOKEN_ADDRESSES from "@/constants/tokenAddresses";
import useSystemFunctions from "./useSystemFunctions";
import { setLoadingBalance } from "@/store/app";
import useBalance from "./useBalance";

type TokenType = keyof typeof TOKEN_ADDRESSES;

const useWithdrawal = () => {
  const { showToast } = useAppActions();
  const { dispatch } = useSystemFunctions();
  const { checkTokenBalance } = useBalance();

  const { sendTransaction } = useSendTransaction({
    onSuccess: (result) => {
      showToast("Successfully withdrew to your wallet!", "success");
      dispatch(setLoadingBalance(true));
      setTimeout(() => {
        checkTokenBalance(TOKEN_ADDRESSES.USDC);
      }, 1500);
    },
  });

  const transferToken = async (
    toAddress: Address,
    amount: number,
    tokenType: TokenType = "USDC"
  ) => {
    try {
      // Get token address
      const tokenAddress = TOKEN_ADDRESSES[tokenType] as Address;

      // Convert amount to proper decimals (USDC uses 6 decimals)
      const decimals = tokenType === "USDC" ? 6 : 18;
      const tokenAmount = parseUnits(amount.toString(), decimals);

      // Encode the ERC20 transfer function call
      const data = encodeFunctionData({
        abi: erc20Abi,
        functionName: "transfer",
        args: [toAddress, tokenAmount],
      });

      const unsignedTx: UnsignedTransactionRequest = {
        to: tokenAddress,
        chainId: base.id,
        data,
        // Important: Do NOT include 'value' for ERC20 transfers
        // Only include 'data' for the contract call
        // Gas estimation will be handled by Privy
      };

      const uiOptions: SendTransactionModalUIOptions = {
        buttonText: `Withdraw ${tokenType}`,
      };

      const { hash } = await sendTransaction(unsignedTx, { uiOptions });
      return hash;
    } catch (error) {
      console.error("Token transfer error:", error);
      throw error;
    }
  };

  const transferEth = async (toAddress: Address, amount: number) => {
    try {
      const weiBigInt = parseUnits(amount.toString(), 18);
      const valueInHex = toHex(weiBigInt);

      const unsignedTx: UnsignedTransactionRequest = {
        to: toAddress,
        chainId: base.id,
        value: valueInHex,
        // For ETH transfers, we include 'value' but no 'data'
      };

      const uiOptions: SendTransactionModalUIOptions = {
        buttonText: "Withdraw ETH",
      };

      const { hash } = await sendTransaction(unsignedTx, { uiOptions });
      return hash;
    } catch (error) {
      console.error("ETH transfer error:", error);
      throw error;
    }
  };

  return {
    transferToken,
    transferEth,
  };
};

export default useWithdrawal;
