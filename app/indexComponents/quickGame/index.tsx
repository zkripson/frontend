import { JSX, useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { KPDialougue } from "@/components";
import useWithdrawal from "@/hooks/useWithdrawal";
import useMatchmaking from "@/hooks/useMatchmaking";
import useSystemFunctions from "@/hooks/useSystemFunctions";
import { useMatchMakingActions } from "@/store/matchmaking/actions";
import { resetMatchmakingState } from "@/store/matchmaking";
import { usePlayerActions } from "@/store/player/actions";
import QuickGameSelect from "./QuickGameSelect";
import QuickGameSearching from "./QuickGameSearching";
import QuickGameFound from "./QuickGameFound";
import { ctaConfig } from "./quickGameHelpers";
import { gameTips } from "./quickGameConfig";

const mapStakeValueToLevel = (stake: StakeValue): StakeLevel => {
  if (stake === "free") return "free";
  if (stake === "2") return "low";
  if (stake === "5") return "medium";
  return "free";
};

export default function QuickGameScreen({ setParentPhase }: QuickGameProps) {
  const [phase, setPhase] = useState<QuickGamePhase>("select");
  const [stake, setStake] = useState<StakeValue>("free");

  const [tipIndex, setTipIndex] = useState(0);

  const [approvingTransfer, setApprovingTransfer] = useState(false);

  const {
    navigate,
    dispatch,
    matchmakingState: { matchmaking },
  } = useSystemFunctions();

  const { approveTransfer } = useWithdrawal();
  const { joinMatchPool } = useMatchMakingActions();
  const { getOngoingSessions } = usePlayerActions();

  const [countdown, setCountdown] = useState<number | null>(null);

  const { cancel } = useMatchmaking({
    enabled: phase === "searching",

    onFound: () => {
      setPhase("found");
      setCountdown(null);
    },

    onCreated: (msg) => {
      setPhase("found");
      setCountdown(5);
    },

    onFailed: () => {
      setPhase("searching");
    },

    onTimeout: () => {
      dispatch(resetMatchmakingState());
      setPhase("select");
      setCountdown(null);
    },
  });

  useEffect(() => {
    const iv = setInterval(() => {
      setTipIndex((i) => (i + 1) % gameTips.length);
    }, 8000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown((c) => (c ?? 0) - 1), 1000);
      return () => clearTimeout(t);
    }

    if (matchmaking?.sessionId) {
      navigate.push(`/${matchmaking.sessionId}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown, matchmaking?.sessionId]);

  // Reset matchmaking state whenever this screen unmounts
  useEffect(() => {
    return () => {
      dispatch(resetMatchmakingState());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectNext = async () => {
    try {
      setApprovingTransfer(true);
      await approveTransfer();
      const stakeLevel = mapStakeValueToLevel(stake);
      await joinMatchPool(stakeLevel, {
        onSuccess: (response: JoinMatchPoolResponse) => {
          if (response?.status === "matched") {
            setPhase("found");
            setCountdown(5);
            // Update ongoing sessions
            getOngoingSessions();
          } else {
            setPhase("searching");
          }
        },
      });
    } finally {
      setApprovingTransfer(false);
    }
  };

  const handleCancel = () => {
    cancel(); // WS + leave pool
    dispatch(resetMatchmakingState()); // clear Redux
    setCountdown(null); // clear countdown
    setPhase("select");
  };

  const primaryCta: IKPButton = useMemo(() => {
    const base = ctaConfig[phase];

    if (phase === "select") {
      return {
        ...base,
        onClick: handleSelectNext,
        loading: approvingTransfer,
      };
    }

    if (phase === "searching") {
      return {
        ...base,
        onClick: handleCancel,
      };
    }

    return {
      ...base,
      hide: true,
      onClick: () => {},
      disabled: true,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, approvingTransfer, stake]);

  // render the three UIs
  const phasesMap: Record<QuickGamePhase, JSX.Element> = {
    select: <QuickGameSelect setStake={setStake} stake={stake} />,
    searching: (
      <QuickGameSearching tip={gameTips[tipIndex]} tipIndex={tipIndex} />
    ),
    found: <QuickGameFound countdown={countdown} />,
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
            {phasesMap[phase]}
          </motion.div>
        </AnimatePresence>
      </div>
    </KPDialougue>
  );
}
