"use client";

import { UIProvider } from "@repo/ui";
import { AuthProvider } from "@/lib/auth";
import { ShopProvider } from "@/lib/shop";
import type { ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <ShopProvider>
        <UIProvider>{children}</UIProvider>
      </ShopProvider>
    </AuthProvider>
  );
}
