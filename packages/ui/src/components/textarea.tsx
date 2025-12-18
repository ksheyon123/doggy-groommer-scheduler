"use client";

import { Textarea as HeroTextarea } from "@heroui/react";
import type { TextAreaProps as HeroTextareaProps } from "@heroui/react";
import { forwardRef } from "react";

export interface TextareaProps extends HeroTextareaProps {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ ...props }, ref) => {
    const classNames = {
      input: "w-full h-full focus-visible:none border-none outline-none",
      inputWrapper:
        "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700",
      ...props.classNames,
    };
    return <HeroTextarea ref={ref} classNames={classNames} {...props} />;
  }
);

Textarea.displayName = "Textarea";
