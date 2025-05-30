"use client";
import Image from "next/image";
import classNames from "classnames";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePrivy } from "@privy-io/react-auth";

import usePrivyLinkedAccounts from "@/hooks/usePrivyLinkedAccounts";
import useSystemFunctions from "@/hooks/useSystemFunctions";
import KPBackdrop from "@/components/backdrop";
import KPButton from "../button";
import { CopyIcon, DropdownIcon } from "@/public/icons";
import useTruncateText from "@/hooks/useTruncateText";
import KPClickAnimation from "../click-animation";
import useCopy from "@/hooks/useCopy";

const KPProfileBadge = ({
  username,
  avatarUrl,
  variant = "primary",
}: IKPProfileBadge) => {
  const { linkedTwitter, activeWallet } = usePrivyLinkedAccounts();
  const { logout } = usePrivy();
  const { truncate } = useTruncateText();
  const { handleCopy } = useCopy("Copied address");
  const {
    appState: { balances, farcasterContext },
    navigate,
  } = useSystemFunctions();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const isTwitter = !!linkedTwitter && !farcasterContext;
  const iconSrc = farcasterContext
    ? "/images/farcaster.webp"
    : linkedTwitter
    ? "/images/x.webp"
    : "/images/farcaster.webp";

  const actions: Array<IKPButton> = [
    {
      title: "Deposit",
      fullWidth: true,
      onClick: () => navigate.push("/deposit"),
    },
    {
      title: "Withdraw",
      fullWidth: true,
      onClick: () => navigate.push("/withdraw"),
    },
    {
      title: "Log out",
      fullWidth: true,
      onClick: async () => {
        setLoggingOut(true);
        await logout();
        window.location.href = "/login";
      },
      variant: "secondary",
    },
  ];

  // Only primary variant gets dropdown
  const handleBadgeClick = () => {
    if (variant === "primary") setDropdownOpen((open) => !open);
  };

  return (
    <div className="relative inline-block">
      <div
        className={classNames(
          "flex items-center rounded-full justify-between border relative", // relative for dropdown positioning
          {
            "bg-primary-450 border-primary-300 w-full max-w-fit px-2 py-2.5 gap-2":
              variant === "primary",
            "bg-primary-450/25 border-primary-50 w-fit lg:max-w-72 xl:max-w-96 h-[31.33px] lg:h-9 xl:h-12 lg:p-1.5 px-1 backdrop-blur-[1px] gap-2 lg:gap-6":
              variant === "secondary",
          }
        )}
        onClick={handleBadgeClick}
        style={{ cursor: variant === "primary" ? "pointer" : undefined }}
      >
        <div className="flex items-center gap-2">
          <Image
            src={avatarUrl || "/images/kripson.webp"}
            alt={username}
            width={300}
            height={300}
            className="size-5 lg:size-8 rounded-full object-cover"
            quality={80}
          />
          <div className="flex flex-col justify-start items-start gap-0.5">
            <span
              className={classNames(
                "text-[9px] lg:text-[14px] leading-none font-semibold",
                {
                  "text-primary-300": variant === "primary",
                  "text-white": variant === "secondary",
                }
              )}
            >
              @{username}
            </span>

            <KPClickAnimation
              onClick={() => handleCopy(activeWallet || "")}
              className="flex items-center gap-1.5"
              stopPropagation
            >
              <p
                className={classNames(
                  "text-[9px] lg:text-[11px] leading-none",
                  {
                    "text-primary-300": variant === "primary",
                    "text-white": variant === "secondary",
                  }
                )}
              >
                {truncate(activeWallet || "")}
              </p>

              <CopyIcon size="16" color="grey" />
            </KPClickAnimation>
          </div>
        </div>
        <div
          className={classNames("pl-2 lg:pl-3", {
            "flex-shrink-0": variant === "primary",
            "flex items-center justify-center gap-2": variant === "secondary",
          })}
        >
          <Image
            src={iconSrc}
            alt={farcasterContext ? "Farcaster" : "Twitter"}
            width={200}
            height={200}
            quality={80}
            className={classNames(
              "size-5 lg:size-7 object-cover rounded-full",
              {
                invert: isTwitter && variant === "primary",
              }
            )}
          />
        </div>
        {variant === "primary" && (
          <DropdownIcon className="size-4 md:size-5 lg:size-6 text-black" />
        )}
      </div>

      {/* Dropdown for primary variant */}
      <AnimatePresence>
        {dropdownOpen && (
          <>
            {/* Backdrop for outside click, absolutely positioned within the root wrapper */}
            <KPBackdrop onClick={() => setDropdownOpen(false)} />

            {/* Dropdown panel */}
            <motion.div
              key="profile-dropdown"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 8 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              className="absolute left-0 top-full mt-2 w-full z-50"
            >
              <div className="bg-primary-450/25 backdrop-blur-sm rounded p-2 border border-primary-50 shadow-lg">
                <div className="flex flex-col items-stretch gap-2 mt-3">
                  {balances.map(({ address, balance, symbol }) => (
                    <div
                      key={address}
                      className="flex items-center justify-center gap-5 bg-primary-450/25 backdrop-blur-sm border border-primary-50 rounded-full h-10"
                    >
                      <span className="text-[18px] leading-none text-white">
                        $
                        {Number(balance).toLocaleString("en-US", {
                          maximumFractionDigits: 2,
                          minimumFractionDigits: 2,
                        })}
                      </span>
                      <span className="text-[12px] leading-none text-white">
                        {symbol}
                      </span>
                    </div>
                  ))}

                  {actions.map((action, index) => (
                    <KPButton
                      key={index}
                      {...action}
                      className="w-full h-[38px]"
                      onClick={() => {
                        action?.onClick?.();
                        if (action.title !== "Log out") {
                          setDropdownOpen(false);
                        }
                      }}
                      isMachine
                      small
                      loading={action.title === "Log out" && loggingOut}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KPProfileBadge;
