"use client";

import { Card as HeroCard, CardBody, CardHeader } from "@heroui/react";
import type { CardProps } from "@heroui/react";

export function Card(props: CardProps) {
  return <HeroCard {...props} />;
}

export { CardBody, CardHeader };
