"use client";

import { Button as HeroButton } from "@heroui/react";
import type { ButtonProps } from "@heroui/react";

export function Button(props: ButtonProps) {
  return <HeroButton {...props} />;
}
