"use client";
import { useState, useRef } from "react";

import KPPinInputBackground from "./background";
import classNames from "classnames";

interface KPPinInputProps {
  length?: number;
  onComplete: (pin: string) => void;
  loading?: boolean;
  error?: boolean;
}

const KPPinInput = ({
  length = 6,
  onComplete,
  loading,
  error,
}: KPPinInputProps) => {
  const [values, setValues] = useState<string[]>(Array(length).fill(""));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newValues = [...values];
    newValues[index] = value;
    setValues(newValues);

    if (value && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }

    if (newValues.every((val) => val.length === 1)) {
      onComplete(newValues.join(""));
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !values[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").trim();
    if (!/^\d+$/.test(paste)) return;

    const pastedValues = paste.slice(0, length).split("");
    const newValues = [...values];
    pastedValues.forEach((char, idx) => {
      if (idx < length) {
        newValues[idx] = char;
      }
    });

    setValues(newValues);

    if (pastedValues.length === length) {
      onComplete(newValues.join(""));
    } else {
      const nextIndex = pastedValues.length;
      inputsRef.current[nextIndex]?.focus();
    }
  };

  return (
    <div
      className={classNames("flex gap-3 max-sm:gap-2", {
        "animate-shake": error,
      })}
    >
      {Array(length)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className={classNames(
              "relative w-[50px] h-[52px] max-sm:w-[33.47px] max-sm:h-[34.81px]",
              {
                "animate-pulse pointer-events-none": loading,
              }
            )}
          >
            <KPPinInputBackground className="w-[50px] h-[52px] max-sm:w-[33.47px] max-sm:h-[34.81px" />

            <input
              ref={(el) => {
                inputsRef.current[i] = el;
              }}
              value={values[i]}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              className="absolute inset-0 w-full h-full flex justify-center items-center bg-transparent outline-none text-center text-[24px] max-sm:text-[18px] font-bold text-primary-250 placeholder-primary-550 font-MachineStd pt-3 max-sm:pt-0 max-sm:top-4"
              maxLength={1}
              inputMode="numeric"
              pattern="[0-9]*"
            />
          </div>
        ))}
    </div>
  );
};

export default KPPinInput;
