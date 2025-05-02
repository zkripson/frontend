"use client";
import { JSX } from "react";
import { motion } from "framer-motion";
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
import { KPClickAnimation } from "@/components";

const ships: {
  variant: IKPShip["variant"];
  image: string;
  outline: JSX.Element;
  width: number;
  height: number;
}[] = [
  {
    variant: "carrier",
    image: "/images/carrier.png",
    outline: <CarrierOutline />,
    width: 195,
    height: 48,
  },
  {
    variant: "battleship",
    image: "/images/battleship.png",
    outline: <BattleshipOutline />,
    width: 156,
    height: 38,
  },
  {
    variant: "cruiser",
    image: "/images/cruiser.png",
    outline: <CruiserOutline />,
    width: 109,
    height: 33,
  },
  {
    variant: "submarine",
    image: "/images/submarine.png",
    outline: <SubmarineOutline />,
    width: 110,
    height: 31,
  },
  {
    variant: "destroyer",
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
}: InventoryProps) => {
  const allInPosition = Object.values(shipsInPosition).every(Boolean);
  const anyInPosition = Object.values(shipsInPosition).some(Boolean);

  const subtitle = allInPosition
    ? "Ships in position"
    : "Drag ship and place on board to position them. Click when on the board to rotate.";

  const disable = !allInPosition || disableReady;

  return (
    <div className="w-[381px] h-[534px] bg-dialougue bg-cover bg-no-repeat bg-center fixed top-[20%] left-0 px-[38px] pt-14 pb-[22px] flex flex-col items-stretch justify-between">
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
                className="flex items-end justify-between gap-3 cursor-pointer"
                onClick={() => onPlaceShip(variant)}
              >
                <div className="relative">
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
          "flex justify-center items-center border rounded-[4px] w-full h-[38px] pt-2 bg-primary-200 border-primary-300 text-white cursor-pointer transition-all duration-500",
          {
            "opacity-15 pointer-events-none": disable,
          }
        )}
        onClick={onReady}
        style={{
          boxShadow: "inset 0px 2px 0px 0px #632918",
        }}
      >
        <span className="uppercase text-[20px] leading-none tracking-[2%] font-MachineStd">
          ready
        </span>
      </motion.button>
    </div>
  );
};

export default Inventory;
