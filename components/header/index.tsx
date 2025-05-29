"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import classNames from "classnames";

import KPIconButton from "../icon-button";
import usePrivyLinkedAccounts from "@/hooks/usePrivyLinkedAccounts";
import useSystemFunctions from "@/hooks/useSystemFunctions";
import useBalance from "@/hooks/useBalance";
import TOKEN_ADDRESSES from "@/constants/tokenAddresses";
import KPProfileBadge from "../profile-badge";
import KPLevel from "../level";
import KPGameRuleModal from "../game-rule-modal";
import { usePlayerActions } from "@/store/player/actions";
import Link from "next/link";

const KPHeader = () => {
  const { checkTokenBalance } = useBalance();
  const { pathname } = useSystemFunctions();
  const { linkedFarcaster, linkedTwitter, activeWallet } =
    usePrivyLinkedAccounts();
  const { getPlayerRewards } = usePlayerActions();
  const { appState } = useSystemFunctions();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const username =
    appState?.farcasterContext?.username || linkedTwitter?.username || "";
  const pfp =
    appState?.farcasterContext?.pfpUrl ||
    linkedTwitter?.profilePictureUrl ||
    undefined;
  const showProfileBadge = pathname === "/" || pathname === "/rewards";

  useEffect(() => {
    checkTokenBalance(TOKEN_ADDRESSES.USDC);
    checkTokenBalance(TOKEN_ADDRESSES.SHIP);

    getPlayerRewards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWallet]);

  return (
    <div className="layout-header-container">
      <header
        className={classNames(
          "fixed top-0 left-0 w-full z-20 px-4 md:px-[5vw] bg-material py-2"
        )}
      >
        <div className="flex justify-between items-center w-full h-full relative">
          <Link href={"/"} className="flex items-center gap-2">
            <Image
              src="/images/bship.webp"
              alt="Speed Battle Logo"
              width={59}
              height={59}
              quality={100}
              className="lg:size-[59px] md:size-[50px] size-[45px]"
            />
            <h1 className="font-MachineStd text-primary-300 text-[clamp(20px,5vw,2rem)] leading-none -mb-2">
              SPEED BATTLE
            </h1>
          </Link>

          <div className="flex items-center gap-4">
            {/* Desktop: show menu */}
            <div className="hidden md:flex items-center gap-4">
              <KPGameRuleModal />
              {/* <KPLevel /> */}
              {showProfileBadge && (
                <div className="shrink-0 w-fit">
                  <KPProfileBadge avatarUrl={pfp} username={username} />
                </div>
              )}
            </div>
            {/* Mobile: show hamburger */}
            <div className="md:hidden">
              <KPIconButton
                icon="ham"
                onClick={() => setMobileMenuOpen((v) => !v)}
                aria-label="Open menu"
              />
            </div>
          </div>

          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "fit-content", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="absolute top-[133%] right-0 left-0 bg-material shadow-lg z-30 flex flex-col items-center justify-center gap-4 px-4 md:hidden rounded-md"
              >
                <div className="mt-2">
                  <KPGameRuleModal />
                </div>
                <div
                  className={classNames("w-fit", {
                    " mb-4": !showProfileBadge,
                  })}
                >
                  {/* <KPLevel /> */}
                </div>
                {showProfileBadge && (
                  <div className="shrink-0 w-fit mb-4">
                    <KPProfileBadge avatarUrl={pfp} username={username} />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>
    </div>
  );
};

export default KPHeader;
