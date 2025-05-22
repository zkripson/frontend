"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

import useSystemFunctions from "@/hooks/useSystemFunctions";
import KPIconButton from "../icon-button";

const SESSION_PATH_REGEX =
  /^\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}(\/.*)?$/;

const KPOngoingSessionsNotifier = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const {
    playerState: { ongoingSessions: sessions },
    navigate,
  } = useSystemFunctions();

  if (sessions.length === 0 || SESSION_PATH_REGEX.test(pathname)) {
    return null;
  }

  const handleIndicatorClick = () => {
    if (sessions.length === 1) {
      navigate.push(`/${sessions[0].sessionId}`);
    } else {
      setIsOpen(true);
    }
  };

  return (
    <>
      <Image
        src="/images/kripson.jpeg"
        alt="Ongoing Sessions"
        width={80}
        height={80}
        className="fixed bottom-4 right-4 size-10 sm:size-14 md:size-16 cursor-pointer z-50 rounded-full"
        onClick={handleIndicatorClick}
      />

      {/* Modal Overlay */}
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
              {/* Close Button */}
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
                    className="block p-4 bg-white/25 backdrop-blur-md border border-primary-450 border-dashed rounded-2xl hover:bg-white/40 transition"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-primary-800 truncate">
                        ID: {session.sessionId}
                      </span>
                      <span
                        className={
                          "text-sm px-2 py-1 rounded-full " +
                          (session.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800")
                        }
                      >
                        {session.status}
                      </span>
                    </div>
                    <p className="text-sm text-primary-600">
                      Created: {new Date(session.createdAt).toLocaleString()}
                    </p>
                    <p className="text-sm text-primary-600">
                      Players: {session.creator} vs{" "}
                      {session.opponent ?? "Waiting..."}
                    </p>
                    {session.isBettingGame && session.stakeAmount && (
                      <p className="text-sm text-primary-600">
                        Stake: ${session.stakeAmount}
                      </p>
                    )}
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
