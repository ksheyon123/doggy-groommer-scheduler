"use client";

import { Textarea as HeroTextarea } from "@heroui/react";
import type { TextAreaProps } from "@heroui/react";

export function Textarea(props: TextAreaProps) {
  const classNames = {
    input: "w-full h-full focus-visible:none border-none outline-none",
    inputWrapper:
      "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700",
    ...props.classNames,
  };
  return <HeroTextarea {...props} classNames={classNames} />;
}
