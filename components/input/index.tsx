"use client";

import KPInputBackground from "./background";
import { IKPInput } from "./types";
import classNames from "classnames";

const KPInput = ({
  name,
  className,
  disabled,
  error,
  label,
  placeholder,
  register,
  type,
}: IKPInput) => {
  return (
    <div className="flex flex-col items-start w-full">
      {label && (
        <label
          htmlFor={name}
          className="text-primary-50 mb-2 text-[18px] max-sm:text-[12px] leading-[100%]"
        >
          {label}
        </label>
      )}

      <div className="relative w-full max-w-[426px] max-sm:max-w-[285px] h-[52px] max-sm:h-[34px]">
        <KPInputBackground />

        <input
          id={name}
          name={name}
          disabled={disabled}
          {...register}
          className={classNames(
            "absolute inset-0 w-full h-full bg-transparent outline-none px-4 text-primary-250 placeholder-primary-550 text-[18px] max-sm:text-[12px] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
            className
          )}
          placeholder={placeholder}
          type={type}
        />
      </div>
    </div>
  );
};

export default KPInput;
