"use client";

import { truncateMiddle } from "@/lib/format";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

export function ConnectWallet({ variant = "default" }: { variant?: "default" | "landing" }) {
  const { connected, publicKey, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const label = connected && publicKey ? truncateMiddle(publicKey.toBase58(), 4, 4) : "Connect Wallet";

  if (variant === "landing") {
    return (
      <button
        type="button"
        onClick={() => (connected ? disconnect() : setVisible(true))}
        className="inline-flex h-11 items-center rounded-full border border-white/14 bg-white/8 px-4 text-[13px] font-medium text-snow backdrop-blur-md transition duration-200 ease-out hover:bg-white/14"
      >
        {label}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden items-center gap-1.5 rounded-full border border-mop/40 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-mop sm:inline-flex">
        <span className="h-1.5 w-1.5 rounded-full bg-mop" />
        Live on Solana
      </span>
      <button
        type="button"
        onClick={() => (connected ? disconnect() : setVisible(true))}
        className="inline-flex h-10 items-center rounded-btn border border-line px-3.5 font-display text-[13px] font-semibold text-snow transition duration-brand hover:border-mop/50 hover:text-mop"
      >
        {label}
      </button>
    </div>
  );
}
