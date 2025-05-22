import { AnimatePresence, motion } from "framer-motion";
import classNames from "classnames";
import CountUp from "react-countup";

import { KPDialougue, KPTokenProgressCard } from "@/components";
import {
  GameOverPointsSummary,
  PointsAwardedMessage,
} from "@/hooks/useGameWebSocket";

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
}

const VictoryStatus = ({
  status = "win",
  onPlayAgain,
  onHome,
  show,
  playerStats,
  gameOverPointsSummary,
  gameOverProcessing,
  pointsAwarded = [],
}: VictoryStatusProps) => {
  if (status !== "win" && status !== "loss" && status !== "draw") {
    console.warn("VictoryStatus got unexpected status:", status);
    status = "win";
  }

  const stats = formatStats(playerStats);
  const totalEarned = gameOverPointsSummary?.[playerStats.address]?.total;

  const mainContent = (
    <div className="flex flex-col gap-6 max-sm:gap-3 w-full">
      <h1
        className={classNames(
          "text-[62px] max-sm:text-[45px] leading-none font-MachineStd text-center",
          {
            "text-primary-1050": status === "win",
            "text-primary-1000": status === "loss",
            "text-primary-250/80": status === "draw",
          }
        )}
      >
        {titles[status]}
      </h1>

      <div className="flex flex-col gap-2">
        <h2 className="text-[32px] max-sm:text-[20px] leading-none font-MachineStd text-primary-50">
          stats
        </h2>
        <div className="flex flex-col gap-3 items-center justify-center">
          {stats.map(({ title, value }) => (
            <div
              key={title}
              className="flex items-center justify-center text-[12px] max-sm:text-[10.69px] leading-none text-primary-50"
            >
              <span>{title}:&nbsp;</span>
              <span className="font-bold">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <KPTokenProgressCard
        earned={totalEarned || 0}
        goal={1500}
        nextLevel={3}
      />

      {/* {gameOverPointsSummary && status !== "draw" && (
        <div className="flex flex-col gap-1 items-center mt-2 p-2 rounded bg-primary-950/60 border border-primary-800 max-w-xs mx-auto">
          <h3 className="text-[16px] font-bold text-primary-50 mb-1">
            Points Summary
          </h3>
          <div className="flex items-center gap-2 text-[13px] text-primary-50">
            <span className="font-semibold text-primary-200">Total:</span>
            <span className="font-bold text-primary-50">{totalEarned}</span>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center text-[11px] text-primary-50 mt-1">
            {gameOverPointsSummary[playerStats.address]?.breakdown.map(
              (item, idx) => (
                <div
                  key={item.category + idx}
                  className="flex flex-col items-center min-w-[60px] px-1"
                >
                  <span
                    className="font-semibold capitalize text-primary-200 truncate max-w-[60px]"
                    title={item.reason}
                  >
                    {item.category.replace(/_/g, " ").toLowerCase()}
                  </span>
                  <span className="font-bold text-primary-50">
                    {item.points > 0 ? `+${item.points}` : item.points}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      )} */}
    </div>
  );

  const loadingContent = (
    <div className="flex flex-col gap-4 items-center justify-center max-sm:-mt-5 sm:-mt-10 w-full">
      <h1 className="text-[clamp(20px,5vw,28px)] text-primary-50 font-MachineStd">
        Processing Game Result...
      </h1>
      <div className="flex flex-col gap-3 w-full bg-primary-1200 border border-primary-450 border-dashed rounded-2xl p-3 md:p-4 lg:p-6">
        {pointsAwarded.map((msg, idx) => (
          <div
            key={idx}
            className="flex justify-between text-[clamp(12px,2.5vw,20px)] text-primary-50"
          >
            <span className="capitalize">
              {msg.category.toLowerCase().replace(/_/g, " ")}
            </span>
            <span className="font-bold text-primary-50">
              <CountUp start={0} end={msg.points} duration={0.6} prefix="+" />
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
              title: "Replay",
              icon: "replay",
              onClick: onPlayAgain,
              iconPosition: "right",
              disabled: gameOverProcessing,
            }}
            secondaryCta={{
              title: "Back Home",
              icon: "home",
              variant: "tertiary",
              onClick: onHome,
              disabled: gameOverProcessing,
            }}
          >
            <AnimatePresence>
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
