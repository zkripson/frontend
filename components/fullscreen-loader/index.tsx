"use client";
import classNames from "classnames";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";

import useSystemFunctions from "@/hooks/useSystemFunctions";
import StakeOverview from "./stake-overview";
import usePrivyLinkedAccounts from "@/hooks/usePrivyLinkedAccounts";
import { AI_OPPONENTS } from "@/constants/aiOpponents";

const KPFullscreenLoader = ({
  title,
  loadingMessages,
  showStakeOverview,
  loaderDuration = 10,
  isComputerGame,
}: IKPFullscreenLoader) => {
  const {
    inviteState: { invitation, bettingCreation },
    playerState: { opponentProfile, ongoingSessions },
    appState,
  } = useSystemFunctions();

  const params = useParams();
  const sessionId = params?.sessionId as string | undefined;
  const difficulty = params?.difficulty as string | undefined;

  let sessionStakeAmount: number | string | undefined = undefined;
  if (sessionId && ongoingSessions && ongoingSessions.length > 0) {
    const session = ongoingSessions.find((s) => s.sessionId === sessionId);
    if (session && session.stakeAmount) {
      sessionStakeAmount = session.stakeAmount;
    }
  }

  const amount =
    sessionStakeAmount !== undefined
      ? sessionStakeAmount
      : Number(invitation?.stakeAmount) ||
        Number(bettingCreation?.stakeAmount) ||
        0;

  const { linkedFarcaster, linkedTwitter } = usePrivyLinkedAccounts();
  const username =
    appState?.farcasterContext?.username || linkedTwitter?.username || "";
  const pfp =
    appState?.farcasterContext?.pfpUrl ||
    linkedTwitter?.profilePictureUrl ||
    undefined;

  // Get AI opponent profile if this is a computer game
  const aiOpponent =
    isComputerGame && difficulty ? AI_OPPONENTS[difficulty] : null;

  return (
    <div
      id="fullscreen-loader"
      className={classNames(
        "fixed inset-0 z-[9999] bg-primary-1100 bg-loadingBackground bg-cover bg-center p-6"
      )}
    >
      <div
        className={classNames(
          "size-full relative flex flex-col items-center justify-center gap-8 max-sm:gap-4",
          {
            "max-sm:justify-start": showStakeOverview,
          }
        )}
      >
        {showStakeOverview && (
          <StakeOverview
            amount={amount}
            leftAvatarUrl={pfp!}
            leftName={username}
            rightAvatarUrl={
              isComputerGame && aiOpponent
                ? aiOpponent.avatarUrl
                : opponentProfile?.avatar
            }
            rightName={
              isComputerGame && aiOpponent
                ? aiOpponent.name
                : opponentProfile?.username
            }
            isComputerGame={isComputerGame}
          />
        )}
        <div className="relative w-full max-w-[357px] max-sm:max-w-[277px] h-[60px] max-sm:max-h-[37px] bg-primary-450 border border-primary-300 px-3.5 py-2.5 max-sm:px-2 max-sm:py-1.5">
          <motion.div
            className="h-full bg-primary-200 border border-primary-300"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{
              duration: loaderDuration,
              ease: "easeInOut",
            }}
          />
        </div>

        <h1 className="text-[26px] max-sm:text-[15.88px] leading-none text-center text-primary-50 font-MachineStd">
          {title}
        </h1>

        {loadingMessages && loadingMessages.length > 0 && (
          <div className="w-full max-w-md flex flex-col items-center justify-end mt-4 absolute bottom-[8%] left-1/2 transform -translate-x-1/2 h-[120px]">
            <AnimatePresence mode="popLayout" initial={false}>
              {loadingMessages.map((message, index) => {
                const isLastMessage = index === loadingMessages.length - 1;
                const shouldApplyGradient =
                  loadingMessages.length >= 5 && isLastMessage;

                return (
                  <motion.p
                    key={message + index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 0.6,
                      ease: "easeOut",
                    }}
                    className={`text-sm md:text-base text-center ${
                      shouldApplyGradient
                        ? "bg-gradient-to-b from-[#FCD8A5] to-[#342D24] bg-clip-text text-transparent"
                        : "text-primary-50"
                    }`}
                  >
                    {message}
                  </motion.p>
                );
              })}
            </AnimatePresence>

            <div className="absolute bottom-0 left-0 w-full h-6 bg-gradient-to-t from-loadingBackground to-transparent pointer-events-none" />
          </div>
        )}

        <div className="absolute top-[5vh] md:top-[15vh] left-0 w-full flex items-center justify-center"></div>
      </div>
    </div>
  );
};

export default KPFullscreenLoader;
