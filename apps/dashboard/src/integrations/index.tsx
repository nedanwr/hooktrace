import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";

import { ConvexIntegration } from "./convex/integration";

export function Integrations({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <ConvexIntegration>{children}</ConvexIntegration>
    </ClerkProvider>
  );
}
