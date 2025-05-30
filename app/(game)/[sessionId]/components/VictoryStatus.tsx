/* eslint-disable @typescript-eslint/no-unused-expressions */
import { AnimatePresence, motion } from "framer-motion";
import classNames from "classnames";
import CountUp from "react-countup";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { sdk } from "@farcaster/frame-sdk";

import { KPDialougue, KPTokenProgressCard } from "@/components";
import {
  BettingPayouts,
  GameOverPointsSummary,
  PointsAwardedMessage,
} from "@/hooks/useGameWebSocket";
import RematchCountdown from "./rematch-countdown";
import useConnectToFarcaster from "@/hooks/useConnectToFarcaster";
import useSystemFunctions from "@/hooks/useSystemFunctions";

const titles = {
  win: "You Win!",
  loss: "You Lost!",
  draw: "It's a Draw!",
} as const;

interface PlayerStats {
  address: string;
  shotsCount: number;
  hitsCount: number;
  accuracy: number;
  shipsSunk: number;
  avgTurnTime: number;
}

const formatStats = (stats: PlayerStats) => [
  { title: "Shots Fired", value: stats.shotsCount.toString() },
  { title: "Hits", value: stats.hitsCount.toString() },
  { title: "Accuracy", value: `${stats.accuracy}%` },
  { title: "Ships Sunk", value: stats.shipsSunk.toString() },
  {
    title: "Avg. Turn Time",
    value: `${(stats.avgTurnTime / 1000).toFixed(1)}s`,
  },
];

interface VictoryStatusProps {
  status?: "win" | "loss" | "draw";
  onPlayAgain?: () => void;
  onHome?: () => void;
  show?: boolean;
  playerStats: PlayerStats;
  gameOverPointsSummary?: GameOverPointsSummary;
  gameOverProcessing: boolean;
  pointsAwarded?: Array<PointsAwardedMessage>;
  bettingPayouts?: BettingPayouts;
}

const VictoryStatus = ({
  status = "win",
  onHome,
  show,
  playerStats,
  gameOverPointsSummary,
  gameOverProcessing,
  pointsAwarded = [],
  bettingPayouts,
}: VictoryStatusProps) => {
  const { isFrameLoaded } = useConnectToFarcaster();
  const {
    playerState: { opponentProfile },
  } = useSystemFunctions();
  const [isSharing, setIsSharing] = useState(false);

  if (status !== "win" && status !== "loss" && status !== "draw") {
    console.warn("VictoryStatus got unexpected status:", status);
    status = "win";
  }

  // Ref to the scrolling container
  const scrollRef = useRef<HTMLDivElement>(null);

  const shareToFarcaster = async (
    accuracy: string,
    avgTurnTime: string,
    totalPoints: number,
    gameUrl: string
  ) => {
    try {
      let opponentReference = "my opponent";
      if (
        opponentProfile?.username &&
        opponentProfile?.channel === "farcaster"
      ) {
        // Use Farcaster mention format for Farcaster users
        opponentReference = `@${opponentProfile.username}`;
      } else if (opponentProfile?.username) {
        // Just use the username without @ for non-Farcaster users
        opponentReference = opponentProfile.username;
      }

      let message = "";
      if (status === "win") {
        message = `🔥 Just demolished ${opponentReference} in Speed Battle! ${playerStats.shipsSunk} ships sunk with ${accuracy} accuracy in just ${avgTurnTime}s per turn! Can you top that?`;
        if (
          bettingPayouts?.winner?.amount &&
          bettingPayouts?.winner?.amount !== "0"
        ) {
          const bettingAmount = Number(
            bettingPayouts.winner.amount
          ).toLocaleString();
          message += `\n\n💰 Walked away with ${bettingAmount} USDC! Easy money.`;
        }
        if (totalPoints > 0) {
          message += `\n\n🏆 Earned ${totalPoints} ribbons toward my next level!`;
        }
      } else if (status === "loss") {
        message = `Just had an epic Speed Battle match against ${opponentReference}! Sunk ${playerStats.shipsSunk} ships with ${accuracy} accuracy. My quickest shots were ${avgTurnTime}s! Next time I'm winning for sure.`;
        if (totalPoints > 0) {
          message += `\n\n🎮 Still earned ${totalPoints} ribbons for playing!`;
        }
      }

      const messageWithUrl =
        message + "\n\nJoin me for a game at " + gameUrl + " 🚢";

      const result = await sdk.actions.composeCast({
        text: messageWithUrl,
        embeds: [gameUrl],
      });

      if (result?.cast) {
        console.log("Cast shared successfully:", result.cast.hash);
        onHome && onHome();
      }
    } catch (e) {
      throw e;
    }
  };

  const shareToTwitter = async (accuracy: string, gameUrl: string) => {
    try {
      let opponentReference = "";
      if (opponentProfile?.username) {
        // For Twitter, add the @ mention if they have a Twitter channel
        if (opponentProfile?.channel === "twitter") {
          opponentReference = ` against @${opponentProfile.username}`;
        } else {
          opponentReference = ` against ${opponentProfile.username}`;
        }
      }

      // Calculate available character space
      const urlLength = 23; // Twitter counts all URLs as 23 characters
      const spacerLength = 1; // Space between text and URL
      const maxTextLength = 280 - urlLength - spacerLength;

      let twitterText = "";
      if (status === "win") {
        // Create base message - keep it short for Twitter
        twitterText = `🔥 Dominated${opponentReference} in Speed Battle! ${playerStats.shipsSunk} ships sunk with ${accuracy} accuracy!`;

        // Add USDC info if space allows
        if (
          bettingPayouts?.winner?.amount &&
          bettingPayouts?.winner?.amount !== "0" &&
          twitterText.length < maxTextLength - 30
        ) {
          const bettingAmount = Number(
            bettingPayouts.winner.amount
          ).toLocaleString();
          twitterText += ` Won ${bettingAmount} USDC! 💰`;
        }
      } else {
        // Loss message
        twitterText = `Just had an epic Speed Battle match${opponentReference}! ${playerStats.shipsSunk} ships sunk with ${accuracy} accuracy!`;
      }

      // Ensure we don't exceed Twitter's limit
      if (twitterText.length > maxTextLength) {
        twitterText = twitterText.substring(0, maxTextLength - 1) + "…";
      }

      const twitterMessage = encodeURIComponent(twitterText);
      const twitterUrl = `https://twitter.com/intent/tweet?text=${twitterMessage}&url=${encodeURIComponent(
        gameUrl
      )}`;

      window.open(twitterUrl, "_blank", "noopener,noreferrer");

      setTimeout(() => {
        onHome && onHome();
      }, 500);
    } catch (e) {
      throw e;
    }
  };

  const share = async () => {
    try {
      setIsSharing(true);

      const accuracy = playerStats.accuracy ? `${playerStats.accuracy}%` : "0%";
      const avgTurnTime = (playerStats.avgTurnTime / 1000).toFixed(1);
      const totalPoints =
        gameOverPointsSummary?.[playerStats.address]?.total || 0;
      const gameUrl = "https://app.speedbattle.fun";

      // Share to appropriate platform
      if (isFrameLoaded) {
        shareToFarcaster(accuracy, avgTurnTime, totalPoints, gameUrl);
      } else {
        shareToTwitter(accuracy, gameUrl);
      }
    } catch (error) {
      console.error("Error sharing:", error);
    } finally {
      setIsSharing(false);
    }
  };

  const stats = formatStats(playerStats);
  const totalEarned = gameOverPointsSummary?.[playerStats.address]?.total;
  const payout = bettingPayouts?.winner?.amount;

  // Scroll to bottom on new points
  useEffect(() => {
    const container = scrollRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }
  }, [pointsAwarded]);

  const mainContent = (
    <div className="flex flex-col gap-6 max-sm:gap-3 w-full">
      <div className="flex flex-col -space-y-3 max-sm:-space-y-1.5 items-center">
        <h1
          className={classNames(
            "text-[66px] max-sm:text-[min(9vw,36px)] leading-none font-MachineStd text-center max-sm:-mt-5",
            {
              "text-primary-1050": status === "win",
              "text-primary-1000": status === "loss",
              "text-primary-250/80": status === "draw",
            }
          )}
        >
          {titles[status]}
        </h1>

        {status === "win" && payout && (
          <div className="flex items-center gap-2 justify-center">
            <Image
              src="/images/usdc-logo.webp"
              alt="USDC"
              width={20}
              height={20}
              quality={100}
              className="w-8 h-8 max-sm:size-5"
            />
            <CountUp
              start={0}
              end={parseFloat(payout)}
              duration={1.5}
              decimals={2}
              suffix=" USDC"
              className="text-[36px] max-sm:text-[min(9vw,20px)] font-semibold text-primary-1050"
            />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 mt-5">
        <h2 className="text-[39px] max-sm:text-[min(9vw,20px)] leading-none font-MachineStd text-primary-50">
          stats
        </h2>
        <div className="flex flex-col gap-3 items-center justify-center">
          {stats.map(({ title, value }) => (
            <div
              key={title}
              className="flex items-center justify-center text-[16px] max-sm:text-[14px] leading-none text-primary-50"
            >
              <span>{title}:&nbsp;</span>
              <span className="font-bold">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {status === "draw" && <RematchCountdown />}

      {status !== "draw" && (
        <KPTokenProgressCard
          earned={totalEarned || 0}
          goal={1500}
          nextLevel={3}
        />
      )}
    </div>
  );

  const loadingContent = (
    <div className="flex flex-col gap-4 items-center justify-center max-sm:-mt-5 sm:-mt-10 w-full">
      <h1 className="text-[clamp(20px,5vw,28px)] text-primary-50 font-MachineStd">
        Processing Game Result...
      </h1>
      <div
        ref={scrollRef}
        className="flex flex-col gap-3 max-sm:max-h-72 max-h-[450px] w-full bg-primary-1200 border border-primary-450 border-dashed rounded-2xl p-3 md:p-4 lg:p-6 overflow-y-auto"
      >
        {pointsAwarded.map((msg, idx) => (
          <div
            key={idx}
            className="flex justify-between text-[clamp(12px,2.5vw,20px)] text-primary-50"
          >
            <span className="capitalize">
              {msg.category.toLowerCase().replace(/_/g, " ")}
            </span>
            <span className="font-bold text-primary-50">
              <CountUp start={0} end={msg.points} duration={2} prefix="+" />
            </span>
          </div>
        ))}
        {Array.from({ length: pointsAwarded.length > 0 ? 1 : 2 }).map(
          (_, idx) => (
            <div
              key={`shimmer-${idx}`}
              className="flex justify-between w-full animate-pulse-opacity"
            >
              <div className="w-2/5 h-4 md:h-6 bg-primary-50 rounded-md" />
              <div className="w-1/5 h-4 md:h-6 bg-primary-50 rounded-md" />
            </div>
          )
        )}
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-[999999]"
        >
          <KPDialougue
            primaryCta={{
              title: isSharing ? "Sharing..." : "Share",
              icon: "share",
              onClick: share,
              iconPosition: "right",
              hide: status === "draw",
              disabled: gameOverProcessing || isSharing,
              loading: isSharing,
            }}
            secondaryCta={{
              title: "Back Home",
              icon: "home",
              variant: "tertiary",
              onClick: onHome,
              disabled: gameOverProcessing || isSharing,
              hide: status === "draw",
            }}
          >
            <AnimatePresence mode="popLayout">
              <motion.div
                key={gameOverProcessing ? "loading" : "main"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center w-full"
              >
                {gameOverProcessing ? loadingContent : mainContent}
              </motion.div>
            </AnimatePresence>
          </KPDialougue>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VictoryStatus;
