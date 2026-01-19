"use client";

import { CommandPalette } from "@/components/command-palette";

export function DashboardClient({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CommandPalette />
      {children}
    </>
  );
}
