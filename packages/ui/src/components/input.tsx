"use client";
import { forwardRef } from "react";
import type { ReactNode } from "react";

import { Input as HeroInput } from "@heroui/react";
import type { InputProps as HeroInputProps } from "@heroui/react";

export interface InputProps extends HeroInputProps {
  labelComponent?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ ...props }, ref) => {
    const classNames = {
      input:
        "w-full h-full focus-visible:none border-none outline-none cursor-pointer",
      inputWrapper:
        "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700",
      ...props.classNames,
    };
    return (
      <>
        {props?.labelComponent && props.labelComponent}
        <HeroInput ref={ref} {...props} classNames={classNames} />
      </>
    );
  }
);

Input.displayName = "Input";
