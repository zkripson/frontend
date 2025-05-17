"use client";
import { JSX, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import classNames from "classnames";

import {
  BattleshipOutline,
  CarrierOutline,
  CheckIcon,
  CruiserOutline,
  DestroyerOutline,
  ShuffleIcon,
  SubmarineOutline,
} from "@/public/icons";
import { KPClickAnimation, KPLoader } from "@/components";
import useSystemFunctions from "@/hooks/useSystemFunctions";

const ships: {
  variant: IKPShip["variant"];
  image: string;
  outline: JSX.Element;
  width: number;
  height: number;
}[] = [
  {
    variant: "Carrier",
    image: "/images/carrier.png",
    outline: <CarrierOutline />,
    width: 195,
    height: 48,
  },
  {
    variant: "Battleship",
    image: "/images/battleship.png",
    outline: <BattleshipOutline />,
    width: 156,
    height: 38,
  },
  {
    variant: "Cruiser",
    image: "/images/cruiser.png",
    outline: <CruiserOutline />,
    width: 109,
    height: 33,
  },
  {
    variant: "Submarine",
    image: "/images/submarine.png",
    outline: <SubmarineOutline />,
    width: 110,
    height: 31,
  },
  {
    variant: "Destroyer",
    image: "/images/destroyer.png",
    outline: <DestroyerOutline />,
    width: 71,
    height: 26,
  },
];

const Inventory = ({
  shipsInPosition,
  onPlaceShip,
  onShuffle,
  onReady,
  disableReady,
  onHide,
  visible,
  show,
  waitingForOpponent,
}: InventoryProps) => {
  const {
    gameState: { loadingSubmitBoardCommitment },
  } = useSystemFunctions();
  const allInPosition = Object.values(shipsInPosition).every(Boolean);
  const anyInPosition = Object.values(shipsInPosition).some(Boolean);

  const subtitle = allInPosition
    ? "Ships in position"
    : "Drag ship and place on board to position them. Click when on the board to rotate.";

  const disable = !allInPosition || disableReady;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isBp1215 = window.innerWidth < 1215;
    if (allInPosition && isBp1215 && show) {
      onHide();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allInPosition, show]);

  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.div
          exit={{ opacity: 0 }}
          animate={{
            left: visible ? 0 : "-100vw",
            scale: visible ? 1 : 0.95,
          }}
          transition={{ type: "spring", duration: 0.5 }}
          className="fixed top-[20%] transform scale-90 bp1215:left-0 bp1215:translate-x-0 sm:scale-95 lg:scale-100 w-[90vw] max-w-[381px] h-[534px] z-20"
        >
          <div className="size-full bg-dialougue bg-cover bg-no-repeat bg-center px-[38px] pt-14 pb-[22px] flex flex-col items-stretch justify-between">
            <div className="flex flex-col items-stretch gap-4">
              <div className="flex flex-col items-center gap-1">
                <h2 className="text-[42px] leading-none text-primary-50 uppercase font-MachineStd">
                  inventory
                </h2>
                <div className="relative">
                  <p className="text-xs text-primary-50 text-center max-w-[256px] min-h-8">
                    {subtitle}
                  </p>

                  {allInPosition && (
                    <div className="min-w-fit absolute -right-6 top-0">
                      <CheckIcon width={16} height={16} />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-4 max-w-72 pl-1 pr-5">
                {ships.map(({ image, outline, variant, height, width }) => {
                  const inPosition = shipsInPosition[variant];
                  return (
                    <div
                      key={variant}
                      className="relative group flex items-end justify-between gap-3"
                      onClick={() => onPlaceShip(variant)}
                    >
                      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(121,85,39,0)_0%,#C34B4B_71.5%,rgba(118,82,36,0)_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-md z-0" />

                      <div className="relative rounded-md z-10">
                        <Image
                          src={image}
                          alt={variant}
                          width={width}
                          height={height}
                          quality={100}
                          className={classNames(
                            "object-cover transition-opacity duration-300",
                            {
                              "opacity-0": inPosition,
                              "opacity-100": !inPosition,
                            }
                          )}
                        />
                        <div
                          className={classNames(
                            "absolute inset-0 flex items-center justify-center transition-opacity duration-300",
                            {
                              "opacity-100": inPosition,
                              "opacity-0": !inPosition,
                            }
                          )}
                        >
                          {outline}
                        </div>
                      </div>

                      {/* Variant label */}
                      <span className="text-primary-50 text-xs capitalize">
                        {variant}
                      </span>
                    </div>
                  );
                })}
              </div>

              <KPClickAnimation
                className={classNames(
                  "flex items-center justify-center gap-2 text-xs mt-5 text-primary-50 cursor-pointer",
                  {
                    "opacity-35 pointer-events-none": !anyInPosition,
                  }
                )}
                onClick={anyInPosition ? onShuffle : undefined}
              >
                <ShuffleIcon />
                <span
                  className={classNames({
                    underline: anyInPosition,
                    "underline-offset-2": anyInPosition,
                  })}
                >
                  Shuffle
                </span>
              </KPClickAnimation>
            </div>

            <motion.button
              whileHover={allInPosition ? { scale: 1.01 } : {}}
              whileTap={allInPosition ? { scale: 0.95 } : {}}
              disabled={disable}
              className={classNames(
                "hidden bp1215:flex justify-center items-center border rounded-[4px] w-full h-[38px] pt-2 bg-primary-200 border-primary-300 text-white cursor-pointer transition-all duration-500",
                {
                  "opacity-15 pointer-events-none": disable,
                }
              )}
              onClick={onReady}
              style={{
                boxShadow: "inset 0px 2px 0px 0px #632918",
              }}
            >
              {loadingSubmitBoardCommitment ? (
                <div className="top-0 left-0 w-full h-full flex items-center justify-center">
                  <KPLoader />
                </div>
              ) : (
                <span className="uppercase text-[20px] leading-none tracking-[2%] font-MachineStd">
                  {waitingForOpponent ? "Waiting for opponent" : "Ready"}
                </span>
              )}
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Inventory;
