"use client";

import { Textarea as HeroTextarea } from "@heroui/react";
import type { TextAreaProps as HeroTextareaProps } from "@heroui/react";
import { forwardRef } from "react";

export interface TextareaProps extends HeroTextareaProps {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ classNames, ...props }, ref) => {
    return (
      <HeroTextarea
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

Textarea.displayName = "Textarea";
