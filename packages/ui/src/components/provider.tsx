"use client";

import { HeroUIProvider } from "@heroui/react";
import { ModalProvider } from "./modal";

export function UIProvider({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      <ModalProvider>{children}</ModalProvider>
    </HeroUIProvider>
  );
}
