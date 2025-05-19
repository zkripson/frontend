"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion, useMotionValue } from "framer-motion";
import Image from "next/image";
import classNames from "classnames";

import { useContainerBounds } from "@/hooks/useContainerBounds";
import { SHIP_LENGTHS } from "@/constants/gameConfig";

interface Props {
  variant: IKPShip["variant"];
  orientation?: IKPShip["orientation"];
  position: { x: number; y: number };
  hitMap: boolean[];
  parentRef: React.RefObject<HTMLDivElement | null>;
  onPositionChange: (pos: { x: number; y: number }) => void;
  onClick?: () => void;
  cellSize: number;
  dragDisabled?: boolean;
  gridSize: number;
}

export default function KPShip({
  variant,
  orientation = "horizontal",
  position,
  hitMap,
  parentRef,
  onPositionChange,
  onClick,
  cellSize,
  dragDisabled,
  gridSize,
}: Props) {
  const shipLength = SHIP_LENGTHS[variant];

  // sinking & disintegration states
  const sunk = hitMap.every((h) => h);
  const [showFire, setShowFire] = useState(true);
  const [disintegrated, setDisintegrated] = useState(false);

  useEffect(() => {
    if (sunk) {
      setShowFire(false);
      setDisintegrated(true);
    }
  }, [sunk]);

  const [isDragging, setIsDragging] = useState(false);

  const x = useMotionValue(position.x * cellSize);
  const y = useMotionValue(position.y * cellSize);
  useEffect(() => {
    x.set(position.x * cellSize);
    y.set(position.y * cellSize);
  }, [position.x, position.y, x, y, cellSize]);

  // drag end snapping
  const handleDragEnd = (
    _: any,
    info: { offset: { x: number; y: number } }
  ) => {
    const rawX = x.get();
    const rawY = y.get();

    let gridX = Math.round(rawX / cellSize);
    let gridY = Math.round(rawY / cellSize);

    const maxX =
      orientation === "horizontal" ? gridSize - shipLength : gridSize - 1;
    const maxY =
      orientation === "vertical" ? gridSize - shipLength : gridSize - 1;

    gridX = Math.max(0, Math.min(gridX, maxX));
    gridY = Math.max(0, Math.min(gridY, maxY));

    // tell the parent
    onPositionChange({ x: gridX, y: gridY });

    // *** snap the visuals back immediately ***
    x.set(gridX * cellSize);
    y.set(gridY * cellSize);

    // clear dragging flag
    setTimeout(() => setIsDragging(false), 0);
  };

  const containerWidth =
    orientation === "horizontal" ? shipLength * cellSize : cellSize;
  const containerHeight =
    orientation === "vertical" ? shipLength * cellSize : cellSize;
  const visualWidth = shipLength * cellSize * 0.9;
  const visualHeight = variant === "Carrier" ? 1.1 * cellSize : 0.8 * cellSize;

  const shipRef = useRef<HTMLDivElement>(null);
  const bounds = useContainerBounds(parentRef, shipRef);

  const dragBounds = {
    left: 0,
    top: 0,
    right:
      orientation === "horizontal"
        ? gridSize * cellSize - shipLength * cellSize
        : gridSize * cellSize - cellSize,
    bottom:
      orientation === "vertical"
        ? gridSize * cellSize - shipLength * cellSize
        : gridSize * cellSize - cellSize,
  };

  return (
    <motion.div
      className={classNames("absolute z-10 cursor-grab", {
        "pointer-events-none": dragDisabled,
      })}
      style={{
        x,
        y,
        width: containerWidth,
        height: containerHeight,
        opacity: disintegrated ? 0.3 : 1,
      }}
      ref={shipRef}
      drag={bounds !== null && !dragDisabled}
      dragConstraints={dragBounds}
      dragElastic={0.2}
      dragMomentum={false}
      dragTransition={{
        bounceStiffness: 50,
        bounceDamping: 20,
        timeConstant: 300,
      }}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      onClick={() => {
        if (!isDragging && onClick) onClick();
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: visualWidth,
            height: visualHeight,
            transform: `translate(-50%, -50%) ${
              orientation === "vertical" ? "rotate(-90deg)" : ""
            }`,
            transformOrigin: "center center",
          }}
          className={classNames({
            "invert-[1]": disintegrated,
          })} // optional CSS mask
        >
          <Image
            src={`/images/${variant?.toLowerCase()}.png`}
            alt={variant}
            width={visualWidth}
            height={visualHeight}
            draggable={false}
            className="pointer-events-none select-none"
          />
        </div>
        {/* hit-map overlay */}
        {/* fire overlay on top of the rotated ship image */}
        {showFire && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: orientation === "horizontal" ? "row" : "column",
              zIndex: 20,
            }}
          >
            {hitMap.map((hit, idx) => (
              <div
                key={idx}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {hit && (
                  <Image
                    src="/images/fire.png"
                    alt="hit"
                    width={cellSize * 0.85}
                    height={cellSize * 0.85}
                    quality={80}
                    className={
                      orientation === "vertical" ? "rotate-[-90deg]" : ""
                    }
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
