"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import KPIconButton from "../icon-button";

const STORAGE_KEY = "kpGameRuleLastShown";
const TWO_WEEKS_MS = 1000 * 60 * 60 * 24 * 14;

const KPGameRuleModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const last = localStorage.getItem(STORAGE_KEY);
    const now = Date.now();

    if (!last || now - parseInt(last, 10) > TWO_WEEKS_MS) {
      setIsOpen(true);
      localStorage.setItem(STORAGE_KEY, now.toString());
    }
  }, []);

  return (
    <>
      <span
        onClick={() => setIsOpen(true)}
        className="cursor-pointer text-[clamp(12px,5vw,14px)] text-primary-300 underline font-semibold"
      >
        Game rules
      </span>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              className="relative bg-material rounded-lg shadow-xl w-[90vw] max-w-2xl h-[80vh] overflow-hidden"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-2 right-2 z-10">
                <KPIconButton
                  icon="close"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close rules"
                />
              </div>

              <div className="h-full overflow-y-auto p-6 space-y-8 text-primary-300">
                <section>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">
                    How to Play
                  </h2>

                  <h3 className="text-lg sm:text-xl font-semibold mb-2">
                    Game Setup 👾
                  </h3>
                  <ol className="list-decimal list-inside space-y-2 ml-4 text-sm sm:text-base">
                    <li>
                      <strong>Create or Join a Game</strong>
                      <ul className="list-disc list-inside ml-6 space-y-1 mt-1">
                        <li>Create an invite link to start a new game</li>
                        <li>Share the link with your opponent</li>
                        <li>Or join using an invite code</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Place Your Ships</strong>
                      <ul className="list-disc list-inside ml-6 space-y-1 mt-1">
                        <li>Position 5 ships on your 10×10 grid:</li>
                        <li>Carrier (5 cells)</li>
                        <li>Battleship (4 cells)</li>
                        <li>Cruiser (3 cells)</li>
                        <li>Submarine (3 cells)</li>
                        <li>Destroyer (2 cells)</li>
                      </ul>
                    </li>
                  </ol>

                  <p className="font-semibold mt-4">Setup Rules ⚠️</p>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-sm sm:text-base">
                    <li>Ships can be placed horizontally or vertically.</li>
                    <li>Ships cannot overlap or touch.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">
                    Gameplay 🎰
                  </h3>
                  <ol className="list-decimal list-inside space-y-2 ml-4 text-sm sm:text-base">
                    <li>
                      <strong>Take Turns</strong>
                      <ul className="list-disc list-inside ml-6 space-y-1 mt-1">
                        <li>Players alternate firing shots</li>
                        <li>Select a coordinate to attack (e.g., A5, C7)</li>
                        <li>You have 15 seconds per turn</li>
                        <li>
                          Hit = continue your turn; Miss = opponent’s turn
                        </li>
                      </ul>
                    </li>
                    <li>
                      <strong>Win Conditions</strong>
                      <ul className="list-disc list-inside ml-6 space-y-1 mt-1">
                        <li>Sink all enemy ships to win</li>
                        <li>Game has a 3-minute time limit</li>
                        <li>
                          If time runs out, player with most ships sunk wins
                        </li>
                      </ul>
                    </li>
                    <li>
                      <strong>Draws</strong>
                      <ul className="list-disc list-inside ml-6 space-y-1 mt-1">
                        <li>
                          When a draw happens, the game restarts automatically
                        </li>
                        <li>
                          Play continues until a winner/loser is determined
                        </li>
                      </ul>
                    </li>
                  </ol>

                  <p className="mt-4 text-sm sm:text-base">
                    <strong>Game Modes:</strong> Betting – stake USDC, winner
                    takes all (minus 10% fee).
                  </p>

                  <p className="mt-6 italic">Good luck, Admiral! ⚓</p>
                </section>

                <section>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">
                    Points System
                  </h2>

                  <h3 className="text-lg sm:text-xl font-semibold mb-2">
                    What are Battleship Points?
                  </h3>
                  <p className="text-sm sm:text-base mb-4">
                    Battleship Points are your gateway to rewards in the
                    Battleship ecosystem. They accrue for playing games, winning
                    matches, and growing our community. Each week, points can be
                    converted into $SHIP tokens, unlocking special features and
                    perks.
                  </p>

                  <h3 className="text-lg sm:text-xl font-semibold mb-2">
                    How to Earn Points
                  </h3>
                  <h4 className="font-semibold mt-2">Game Participation</h4>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-sm sm:text-base">
                    <li>Playing Games: 50 points per completed game</li>
                    <li>Victory Bonus: +150 points for a win (200 total)</li>
                    <li>
                      Win Streak: +20 points per consecutive win (resets on
                      loss)
                    </li>
                    <li>Quick Game: +25 points if game ends in &lt;25 moves</li>
                  </ul>

                  <h4 className="font-semibold mt-4">Strategic Play</h4>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-sm sm:text-base">
                    <li>Shot Efficiency: +2 points per unused shot</li>
                    <li>First Blood: +15 points for first hit</li>
                    <li>Ship Destroyer: +30 points per ship destroyed</li>
                  </ul>

                  <h4 className="font-semibold mt-4">
                    Daily & Weekly Activity
                  </h4>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-sm sm:text-base">
                    <li>Daily Player: +25 points for first game each day</li>
                    <li>Weekly Commitment: +100 points for 5+ games/week</li>
                  </ul>

                  <h4 className="font-semibold mt-4">Referral Program</h4>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-sm sm:text-base">
                    <li>
                      New Player Referral: +100 points when invitee’s first game
                      completes
                    </li>
                    <li>
                      Referral Game Bonus: +10 points per game your referrals
                      play
                    </li>
                    <li>
                      Referral Commission: 10% of all points your referrals earn
                    </li>
                    <li>
                      Multi-level Referrals: +5 points when your referrals bring
                      in new players
                    </li>
                  </ul>

                  <h3 className="text-lg sm:text-xl font-semibold mt-6 mb-2">
                    Weekly $SHIP Token Claims
                  </h3>
                  <ul className="list-decimal list-inside ml-4 space-y-1 text-sm sm:text-base">
                    <li>Snapshot: Mondays at 11:59 PM UTC</li>
                    <li>Claim Window: Tuesdays at 4:20 PM UTC</li>
                    <li>Minimum 100 points required</li>
                    <li>14-day claim period before expiration</li>
                  </ul>
                </section>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default KPGameRuleModal;
