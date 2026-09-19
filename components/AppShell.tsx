"use client";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { WalletProviders } from "@/components/WalletProviders";
import { cn } from "@/lib/format";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <WalletProviders>
      <ShellFrame>{children}</ShellFrame>
    </WalletProviders>
  );
}

function ShellFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const landing = pathname === "/";

  return (
    <div className={cn("min-h-screen", landing ? "landing-page bg-void" : "ff-grid")}>
      <div className={cn("min-h-screen", landing ? "" : "ff-noise")}>
        {landing ? null : <Header />}
        <main className={landing ? "" : "mx-auto w-full max-w-6xl px-4 py-8 md:py-10"}>
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
