"use client";

import { solscanTx } from "@/lib/config";
import { cn, truncateMiddle } from "@/lib/format";
import { useState } from "react";

export function TxChip({
  signature,
  className,
}: {
  signature: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(signature);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      /* ignore */
    }
  }

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <a
        href={solscanTx(signature)}
        target="_blank"
        rel="noreferrer"
        className="ff-chip hover:border-mop/40 hover:text-snow"
        title={signature}
      >
        {truncateMiddle(signature, 4, 4)}
        <ExternalIcon />
      </a>
      <button
        type="button"
        onClick={copy}
        className="text-[11px] text-fog hover:text-mop"
        aria-label="Copy transaction"
      >
        {copied ? "copied" : "copy"}
      </button>
    </span>
  );
}

export function AddressChip({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      /* ignore */
    }
  }
  return (
    <button type="button" onClick={copy} className="ff-chip hover:text-snow" title={address}>
      {truncateMiddle(address, 4, 4)}
      <span className="text-fog">{copied ? "copied" : ""}</span>
    </button>
  );
}

function ExternalIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="M4 2H10V8" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10 2L3 9" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
