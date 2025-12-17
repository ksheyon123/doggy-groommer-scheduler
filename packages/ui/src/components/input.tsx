"use client";

import { Input as HeroInput } from "@heroui/react";
import type { InputProps } from "@heroui/react";
import type { ReactNode } from "react";

interface IProps extends InputProps {
  labelComponent?: ReactNode;
}

export function Input(props: IProps) {
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
      <HeroInput {...props} classNames={classNames} />
    </>
  );
}
