"use client";

import { Input as HeroInput } from "@heroui/react";
import type { InputProps } from "@heroui/react";

export function Input(props: InputProps) {
  const classNames = {
    input:
      "w-full h-full focus-visible:none border-none outline-none cursor-pointer",
    inputWrapper:
      "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700",
    ...props.classNames,
  };
  console.log(props.classNames);
  return <HeroInput {...props} classNames={classNames} />;
}
