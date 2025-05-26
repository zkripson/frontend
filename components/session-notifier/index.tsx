"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

import useSystemFunctions from "@/hooks/useSystemFunctions";
import KPIconButton from "../icon-button";
import KPButton from "../button";

const SESSION_PATH_REGEX =
  /^\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}(\/.*)?$/;

const KPOngoingSessionsNotifier = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const {
    playerState: { ongoingSessions: sessions },
    navigate,
  } = useSystemFunctions();

  // Hide notifier on session pages or when no sessions
  if (sessions.length === 0 || SESSION_PATH_REGEX.test(pathname)) {
    return null;
  }

  const floatingTitle = `Join Battle${sessions.length > 1 ? "s" : ""}`;

  const handleIndicatorClick = () => {
    if (sessions.length === 1) {
      navigate.push(`/${sessions[0].sessionId}`);
    } else {
      setIsOpen(true);
    }
  };

  return (
    <>
      <div
        onClick={handleIndicatorClick}
        className="fixed bottom-4 right-4 z-50 cursor-pointer flex flex-col items-center"
      >
        <div className="relative">
          {/* Glowing pulse behind the icon */}
          <div className="absolute inset-0 rounded-full bg-primary-50/90 blur-xl animate-ping" />
          <Image
            src="/images/pendingBattles.webp"
            alt="Ongoing Sessions"
            width={80}
            height={80}
            className="relative size-10 sm:size-14 md:size-16 object-fill scale-150"
          />
        </div>

        {/* Centered, animated text */}
        <span className="text-primary-50 text-[clamp(10px,5vw,14px)] font-bold animate-bounce">
          {floatingTitle}
        </span>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-material rounded-2xl shadow-lg max-w-md w-full p-6 relative"
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.85 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Close */}
              <div className="absolute top-2 right-2 z-10">
                <KPIconButton
                  icon="close"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close"
                />
              </div>

              <h2 className="text-xl font-semibold mb-4 text-primary-300">
                Ongoing Sessions
              </h2>

              <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto hide-scrollbar">
                {sessions.map((session) => (
                  <Link
                    key={session.sessionId}
                    href={`/${session.sessionId}`}
                    className="block p-4 max-sm:p-2.5 bg-white/25 backdrop-blur-md border border-primary-450 border-dashed rounded-2xl hover:shadow-lg transition-shadow"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {session.isBettingGame && session.stakeAmount && (
                          <span className="text-xs font-medium text-primary-800 bg-primary-50 px-2 py-0.5 rounded-full">
                            Stake:{" "}
                            <span className="font-bold">
                              ${session.stakeAmount}
                            </span>
                          </span>
                        )}
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            session.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {session.status.charAt(0).toUpperCase() +
                            session.status.slice(1)}
                        </span>
                      </div>
                      <span className="text-[10px] text-primary-300 italic">
                        {typeof session.createdAt === "number"
                          ? new Date(session.createdAt).toLocaleString(
                              undefined,
                              {
                                dateStyle: "medium",
                                timeStyle: "short",
                              }
                            )
                          : session.createdAt}
                      </span>
                    </div>

                    <KPButton
                      title="Join Battle"
                      fullWidth
                      variant="primary"
                      small
                      isMachine
                    />
                  </Link>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default KPOngoingSessionsNotifier;
