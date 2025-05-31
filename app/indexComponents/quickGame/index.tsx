import { JSX, useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { KPDialougue } from "@/components";
import useWithdrawal from "@/hooks/useWithdrawal";
import useMatchmaking from "@/hooks/useMatchmaking";
import QuickGameSelect from "./QuickGameSelect";
import QuickGameSearching from "./QuickGameSearching";
import QuickGameFound from "./QuickGameFound";
import { ctaConfig } from "./quickGameHelpers";
import { gameTips } from "./quickGameConfig";

const QuickGameScreen = ({ setParentPhase }: QuickGameProps) => {
  const [phase, setPhase] = useState<QuickGamePhase>("select");
  const [stake, setStake] = useState<StakeValue>("free");
  const [tipIndex, setTipIndex] = useState(0);
  const [approvingTransfer, setApprovingTransfer] = useState(false);

  const { approveTransfer } = useWithdrawal();

  const { cancel } = useMatchmaking({
    stake,
    enabled: phase === "searching",
    onFound: () => setPhase("found"),
  });

  useEffect(() => {
    const iv = setInterval(() => {
      setTipIndex((i) => (i + 1) % gameTips.length);
    }, 8000);
    return () => clearInterval(iv);
  }, []);

  /** CTA handlers */
  const handleSelectNext = async () => {
    try {
      setApprovingTransfer(true);
      await approveTransfer();
      setPhase("searching");
    } catch (err) {
      console.error(err);
    } finally {
      setApprovingTransfer(false);
    }
  };

  const handleCancel = () => {
    cancel();
    setPhase("select");
  };

  const handleFoundNext = () => {
    // TODO: perform other actions like routing to game session page
  };

  const primaryCta: IKPButton = useMemo(() => {
    const base = ctaConfig[phase];
    let onClick: () => void;
    let loading = false;
    if (phase === "select") {
      onClick = handleSelectNext;
      loading = approvingTransfer;
    } else if (phase === "searching") onClick = handleCancel;
    /* found */ else onClick = handleFoundNext;

    return { ...base, onClick, loading };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, approvingTransfer]);

  const phases: Record<QuickGamePhase, JSX.Element> = {
    select: <QuickGameSelect setStake={setStake} stake={stake} />,
    searching: (
      <QuickGameSearching tip={gameTips[tipIndex]} tipIndex={tipIndex} />
    ),
    found: <QuickGameFound />,
  };

  return (
    <KPDialougue
      showBackButton={phase === "select"}
      onBack={() => setParentPhase("select")}
      primaryCta={primaryCta}
      className="pt-[88px]"
    >
      <div className="flex flex-col items-center gap-16 max-sm:gap-7 self-stretch w-full">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={phase}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            {phases[phase]}
          </motion.div>
        </AnimatePresence>
      </div>
    </KPDialougue>
  );
};

export default QuickGameScreen;
