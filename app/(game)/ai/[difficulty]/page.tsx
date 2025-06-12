"use client";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";

import usePrivyLinkedAccounts from "@/hooks/usePrivyLinkedAccounts";
import useSystemFunctions from "@/hooks/useSystemFunctions";
import useAIGameSession from "@/hooks/useAIGameSession";
import { resetOpponentState } from "@/store/player";
import { LoadingOverlay } from "../../[sessionId]/components/LoadingOverlay";
import { GameHeader } from "../../[sessionId]/components/GameHeader";
import GameBoardContainer from "../../[sessionId]/components/GameBoardContainer";
import GameFooter from "../../[sessionId]/components/GameFooter";
import VictoryStatus from "../../[sessionId]/components/VictoryStatus";

const GameSession = () => {
  const params = useParams();
  const { activeWallet } = usePrivyLinkedAccounts();
  const { dispatch } = useSystemFunctions();

  const {
    gameStateLocal,
    messages,
    loadingDone,
    generalMessage,
    makeShot,
    onReady,
    updateShipPosition,
    flipShip,
    handleOverlap,
    overlaps,
    disableReadyButton,
    mode,
    yourTurn,
    playerBoard,
    opponentBoard,
    placedShips,
    opponentShips,
    selfAddress,
    opponentAddress,
    playerStatus,
    opponentStatus,
    infoShow,
    setUserDismissedInfo,
    showVictory,
    victoryStatus,
    handlePlayAgain,
    currentTurn,
    boardSubmitted,
    playerStats,
  } = useAIGameSession(params.difficulty as string);

  useEffect(() => {
    return () => {
      dispatch(resetOpponentState(null));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative flex items-center justify-center flex-1">
      <LoadingOverlay
        loading={!loadingDone}
        loadingMessages={messages}
        isComputerGame
      />

      {loadingDone && (
        <motion.div
          key="game"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full h-full flex flex-col items-center justify-center"
        >
          <GameHeader mode={mode} isComputerGame />

          <GameBoardContainer
            placedShips={placedShips}
            updateShipPosition={updateShipPosition}
            flipShip={flipShip}
            handleOverlap={handleOverlap}
            mode={mode}
            currentTurn={currentTurn}
            opponentBoard={opponentBoard}
            playerBoard={playerBoard}
            handleShoot={makeShot}
            generalMessage={generalMessage}
            disableReadyButton={disableReadyButton}
            onReady={onReady}
            onFireShot={makeShot}
            waitingForOpponent={false}
            yourTurn={yourTurn}
            boardSubmitted={boardSubmitted}
            {...(mode === "game" && { opponentShips })}
          />

          <GameFooter
            overlaps={overlaps}
            infoShow={infoShow}
            setUserDismissedInfo={setUserDismissedInfo}
            generalMessage={generalMessage}
            playerAddress={selfAddress}
            opponentAddress={opponentAddress}
            playerStatus={playerStatus}
            opponentStatus={opponentStatus}
            mode={mode}
            isComputerGame
          />
        </motion.div>
      )}

      <VictoryStatus
        show={showVictory}
        status={victoryStatus}
        onHome={handlePlayAgain}
        playerStats={playerStats}
        gameOverProcessing={false}
      />
    </div>
  );
};

export default GameSession;
