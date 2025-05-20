"use client";
import { motion } from "framer-motion";

import usePrivyLinkedAccounts from "@/hooks/usePrivyLinkedAccounts";
import { useParams } from "next/navigation";
import { LoadingOverlay } from "./components/LoadingOverlay";
import { GameHeader } from "./components/GameHeader";
import { SetupPanel } from "./components/SetupPanel";
import GameBoardContainer from "./components/GameBoardContainer";
import GameFooter from "./components/GameFooter";
import VictoryStatus from "./components/VictoryStatus";

import useGameSession from "@/hooks/useGameSession";

const GameSession = () => {
  const params = useParams();
  const { activeWallet } = usePrivyLinkedAccounts();

  const {
    gameStateLocal,
    gameTimeRemaining,
    messages,
    loadingDone,
    generalMessage,
    makeShot,
    onPlaceShip,
    onShuffle,
    onReady,
    updateShipPosition,
    flipShip,
    handleOverlap,
    overlaps,
    mode,
    yourTurn,
    turnStartedAt,
    gameCode,
    inventoryVisible,
    setInventoryVisible,
    shipsInPosition,
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
  } = useGameSession(params.sessionId as string);

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
            <div className="absolute top-0 w-full bg-red-500 text-white p-2 text-center">
              {connectionError}
            </div>
          )}

          <GameHeader
            mode={mode}
            yourTurn={yourTurn}
            turnStartedAt={turnStartedAt}
            gameCode={gameCode}
            onTurnExpiry={onTurnExpiry}
            gameTimeRemaining={gameTimeRemaining}
            inventoryVisible={inventoryVisible}
            setInventoryVisible={setInventoryVisible}
          />

          <SetupPanel
            inventoryVisible={inventoryVisible}
            setInventoryVisible={() => setInventoryVisible(false)}
            shipsInPosition={shipsInPosition}
            onPlaceShip={onPlaceShip}
            onShuffle={onShuffle}
            onReady={onReady}
            disableReadyButton={disableReadyButton}
            mode={mode}
            waitingForOpponent={gameStateLocal.players.length < 2}
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
            inventoryVisible={inventoryVisible}
            onReady={onReady}
            onFireShot={makeShot}
            waitingForOpponent={gameStateLocal.players.length < 2}
            yourTurn={yourTurn}
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
        show={showVictory}
        status={victoryStatus}
        onPlayAgain={handlePlayAgain}
        onHome={handlePlayAgain}
        playerStats={
          gameStateLocal.playerStats?.[activeWallet?.address || ""] || {
            address: activeWallet?.address || "",
            shotsCount: 0,
            hitsCount: 0,
            accuracy: 0,
            shipsSunk: 0,
            avgTurnTime: 0,
          }
        }
        gameOverPointsSummary={gameOverPointsSummary}
      />
    </div>
  );
};

export default GameSession;
