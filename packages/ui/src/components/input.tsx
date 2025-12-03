"use client";

import { Input as HeroInput } from "@heroui/react";
import type { InputProps as HeroInputProps } from "@heroui/react";
import { forwardRef } from "react";

export interface InputProps extends HeroInputProps {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ classNames, ...props }, ref) => {
    return (
      <HeroInput
        ref={ref}
        classNames={{
          ...classNames,
          input: `focus-visible:outline-none ${classNames?.input ?? ""}`.trim(),
        }}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
