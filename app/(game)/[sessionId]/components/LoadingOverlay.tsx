import { AnimatePresence, motion } from "framer-motion";
import { KPFullscreenLoader } from "@/components";

interface LoadingOverlayProps {
  loading: boolean;
  loadingMessages: string[];
  isComputerGame?: boolean;
}

export function LoadingOverlay({
  loading,
  loadingMessages,
  isComputerGame,
}: LoadingOverlayProps) {
  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="loader"
          className="absolute inset-0 z-[9999]"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <KPFullscreenLoader
            title="loading new game..."
            loadingMessages={loadingMessages}
            showStakeOverview
            isComputerGame={isComputerGame}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
