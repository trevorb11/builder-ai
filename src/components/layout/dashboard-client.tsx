"use client";

import { CommandPalette } from "@/components/command-palette";
import { AIAssistant } from "@/components/assistant/ai-assistant";

export function DashboardClient({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CommandPalette />
      <AIAssistant />
      {children}
    </>
  );
}
