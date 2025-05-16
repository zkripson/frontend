import { useState, useEffect } from "react";
import { isAddress } from "viem";

function useAddressValidator(address: string, delay: number = 1000) {
  const [isAddressValid, setIsAddressValid] = useState(false);

  const check = () => {
    if (!address) {
      setIsAddressValid(false);
      return;
    }

    // Check Ethereum address validity
    setIsAddressValid(isAddress(address));
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      check();
    }, delay);

    return () => {
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  return { isAddressValid };
}

export default useAddressValidator;
