"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

export function ThemeProvider({ children }: { children: ReactNode }) {
  // next-themes renders an inline FOUC-prevention <script>. Setting
  // type="application/json" stops React 19 from treating it as a
  // component-rendered executable script (see next-themes#387), which
  // otherwise logs "Encountered a script tag while rendering React component".
  const scriptProps =
    typeof window === "undefined"
      ? undefined
      : ({ type: "application/json" } as const);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      scriptProps={scriptProps}
    >
      {children}
    </NextThemesProvider>
  );
}
