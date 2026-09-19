"use client";

import { ConnectWallet } from "@/components/ConnectWallet";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/format";
import Link from "next/link";
import { useState } from "react";

const LINKS = [
  { href: "/docs", label: "How it works" },
  { href: "/collections", label: "Collections" },
  { href: "/sweeps", label: "Sweeps" },
  { href: "/analytics", label: "Analytics" },
];

export function LandingNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="pointer-events-auto absolute inset-x-0 top-0 z-20 px-4 pt-4 md:px-7 md:pt-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-7">
          <Logo />
          <nav className="hidden items-center gap-6 lg:flex">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[14px] font-medium text-snow/78 transition duration-200 ease-out hover:text-snow"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <ConnectWallet variant="landing" />
          </div>
          <Link
            href="/launch"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-snow px-5 text-[14px] font-semibold text-void transition duration-200 ease-out hover:bg-white"
          >
            Launch coin
            <ArrowIcon />
          </Link>
          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/8 text-snow backdrop-blur-md lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">Menu</span>
            <span className="space-y-1.5">
              <span className={cn("block h-px w-4 bg-snow transition", open && "translate-y-[4px] rotate-45")} />
              <span className={cn("block h-px w-4 bg-snow transition", open && "-translate-y-[4px] -rotate-45")} />
            </span>
          </button>
        </div>
      </div>

      {open ? (
        <nav className="ff-glass mt-3 rounded-3xl p-3 lg:hidden">
          <div className="grid gap-1">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-2xl px-3 py-2.5 text-sm font-medium text-snow hover:bg-white/8"
              >
                {link.label}
              </Link>
            ))}
            <div className="px-1 pt-1 sm:hidden">
              <ConnectWallet variant="landing" />
            </div>
          </div>
        </nav>
      ) : null}
    </div>
  );
}

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
