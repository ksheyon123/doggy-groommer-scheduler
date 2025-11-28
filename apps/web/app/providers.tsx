"use client";

import { UIProvider } from "@repo/ui";
import { AuthProvider } from "@/lib/auth";
import type { ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <UIProvider>{children}</UIProvider>
    </AuthProvider>
  );
}
