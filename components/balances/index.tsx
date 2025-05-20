import Image from "next/image";
import classNames from "classnames";

import useSystemFunctions from "@/hooks/useSystemFunctions";

const KPBalances = ({ isSmall }: { isSmall?: boolean }) => {
  const { appState } = useSystemFunctions();
  const { balances } = appState;
  return (
    <>
      {balances?.map((token) => (
        <div
          key={token.address}
          className={classNames(
            "flex flex-col text-white items-start",
            isSmall ? "gap-0" : "gap-1"
          )}
        >
          <span
            className={classNames(
              "font-MachineStd font-bold",
              isSmall ? "text-[16px]" : "text-[clamp(20px,5vw,26px)]"
            )}
          >
            $
            {Number(token.balance).toLocaleString("en-US", {
              maximumFractionDigits: 2,
              minimumFractionDigits: 2,
            })}
          </span>
          <span
            className={classNames(
              "flex items-center gap-1",
              isSmall ? "text-[8px]" : "text-[clamp(10px,5vw,12px)]"
            )}
          >
            {token.symbol.toLowerCase() === "usdt" && (
              <Image
                src="/images/usdt.png"
                alt="usdt"
                width={18}
                height={18}
                quality={80}
                className={classNames(
                  "object-cover",
                  isSmall ? "size-[14px]" : "size-[18px]"
                )}
              />
            )}
            {token.symbol}
          </span>
        </div>
      ))}
    </>
  );
};

export default KPBalances;
