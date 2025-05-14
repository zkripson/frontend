"use client";

import { AnimatePresence, motion } from "framer-motion";
import classNames from "classnames";
import { KPDialougue } from "@/components";

const titles = {
  win: "You Win!",
  loss: "You Lost!",
} as const;

const statsData = {
  win: {
    totalGamesPlayed: { title: "Total Games Played", value: 12 },
    winRate: { title: "Win Rate", value: "60%" },
    avgMoveSpeed: { title: "Avg. Move Speed", value: "3.4s" },
    matchLength: { title: "Match Length", value: "2m 15s" },
    longestMatch: { title: "Longest Match", value: "5m 02s" },
  },
  loss: {
    totalGamesPlayed: { title: "Total Games Played", value: 8 },
    winRate: { title: "Win Rate", value: "25%" },
    avgMoveSpeed: { title: "Avg. Move Speed", value: "4.8s" },
    matchLength: { title: "Match Length", value: "3m 40s" },
    longestMatch: { title: "Longest Match", value: "6m 10s" },
  },
} as const;

interface VictoryStatusProps {
  status?: "win" | "loss";
  onPlayAgain?: () => void;
  onHome?: () => void;
  show?: boolean;
}

const VictoryStatus = ({
  status = "win",
  onPlayAgain,
  onHome,
  show,
}: VictoryStatusProps) => {
  // safe‑guard: if status isn't exactly "win" or "loss", fallback to "win"
  if (status !== "win" && status !== "loss") {
    console.warn("VictoryStatus got unexpected status:", status);
    status = "win";
  }

  // use fallback empty object so Object.entries never sees undefined
  const stats = statsData[status] ?? {};

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
                  {Object.entries(stats).map(([key, { title, value }]) => (
                    <div
                      key={key}
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
