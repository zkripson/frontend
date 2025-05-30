"use client";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";

import usePrivyLinkedAccounts from "@/hooks/usePrivyLinkedAccounts";
import useSystemFunctions from "@/hooks/useSystemFunctions";
import useGameSession from "@/hooks/useGameSession";
import { resetOpponentState } from "@/store/player";
import { LoadingOverlay } from "./components/LoadingOverlay";
import { GameHeader } from "./components/GameHeader";
import GameBoardContainer from "./components/GameBoardContainer";
import GameFooter from "./components/GameFooter";
import VictoryStatus from "./components/VictoryStatus";

const GameSession = () => {
  const params = useParams();
  const { activeWallet } = usePrivyLinkedAccounts();
  const { dispatch } = useSystemFunctions();

  const {
    gameStateLocal,
    gameTimeRemaining,
    messages,
    loadingDone,
    generalMessage,
    makeShot,
    onReady,
    updateShipPosition,
    flipShip,
    handleOverlap,
    overlaps,
    mode,
    yourTurn,
    turnStartedAt,
    gameCode,
    playerBoard,
    opponentBoard,
    placedShips,
    opponentShips,
    disableReadyButton,
    selfAddress,
    opponentAddress,
    playerStatus,
    opponentStatus,
    infoShow,
    setUserDismissedInfo,
    showVictory,
    victoryStatus,
    handlePlayAgain,
    onTurnExpiry,
    currentTurn,
    connectionError,
    gameOverPointsSummary,
    gameOverProcessing,
    pointsAwarded,
    bettingPayouts,
    boardSubmitted,
  } = useGameSession(params.sessionId as string);

  useEffect(() => {
    return () => {
      dispatch(resetOpponentState(null));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative flex items-center justify-center flex-1">
      <LoadingOverlay loading={!loadingDone} loadingMessages={messages} />

      {loadingDone && (
        <motion.div
          key="game"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full h-full flex flex-col items-center justify-center"
        >
          {connectionError && (
            <div className="absolute top-0 w-full bg-orange-500 text-white p-2 text-center">
              {connectionError}
            </div>
          )}

          <GameHeader
            mode={mode}
            turnStartedAt={turnStartedAt}
            gameCode={gameCode}
            onTurnExpiry={onTurnExpiry}
            gameTimeRemaining={gameTimeRemaining}
          />

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
            waitingForOpponent={gameStateLocal.players.length < 2}
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
          />
        </motion.div>
      )}

      <VictoryStatus
        gameOverProcessing={gameOverProcessing}
        show={showVictory || gameOverProcessing}
        status={victoryStatus}
        onHome={handlePlayAgain}
        playerStats={
          gameStateLocal.playerStats?.[activeWallet || ""] || {
            address: activeWallet || "",
            shotsCount: 0,
            hitsCount: 0,
            accuracy: 0,
            shipsSunk: 0,
            avgTurnTime: 0,
          }
        }
        gameOverPointsSummary={gameOverPointsSummary}
        pointsAwarded={pointsAwarded}
        bettingPayouts={bettingPayouts}
      />
    </div>
  );
};

export default GameSession;
