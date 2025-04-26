import { InputHTMLAttributes } from "react";
import { UseFormRegisterReturn } from "react-hook-form";

interface IKPInput {
  placeholder?: string;
  error?: boolean;
  type?: InputHTMLAttributes<HTMLInputElement>["type"];
  register?: UseFormRegisterReturn;
  name: string;
  disabled?: boolean;
  className?: string;
  label?: string;
}

export type { IKPInput };
