"use client";

import { AnimatePresence, motion } from "framer-motion";
import classNames from "classnames";
import { KPDialougue } from "@/components";

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
}

const VictoryStatus = ({
  status = "win",
  onPlayAgain,
  onHome,
  show,
  playerStats,
}: VictoryStatusProps) => {
  // safe‑guard: if status isn't exactly "win" or "loss", fallback to "win"
  if (status !== "win" && status !== "loss" && status !== "draw") {
    console.warn("VictoryStatus got unexpected status:", status);
    status = "win";
  }

  const stats = formatStats(playerStats);

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
            showKripsonImage
            primaryCta={{
              title: "Replay",
              icon: "replay",
              onClick: onPlayAgain,
              iconPosition: "right",
            }}
            secondaryCta={{
              title: "Back Home",
              icon: "home",
              variant: "tertiary",
              onClick: onHome,
            }}
          >
            <div className="flex flex-col gap-6 max-sm:gap-3">
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
            </div>
          </KPDialougue>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VictoryStatus;
