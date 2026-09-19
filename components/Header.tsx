"use client";

import { ConnectWallet } from "@/components/ConnectWallet";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/format";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/launch", label: "Launch" },
  { href: "/collections", label: "Collections" },
  { href: "/sweeps", label: "Sweeps" },
  { href: "/analytics", label: "Analytics" },
  { href: "/docs", label: "Docs" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-void/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Logo />
        <nav className="hidden items-center gap-6 md:flex">
          {LINKS.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative font-display text-[13px] font-medium uppercase tracking-[0.14em] transition duration-brand",
                  active ? "text-mop" : "text-fog hover:text-snow",
                )}
              >
                {link.label}
                {active ? (
                  <span className="absolute -bottom-3 left-0 right-0 h-px bg-mop" />
                ) : null}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <ConnectWallet />
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-btn border border-line md:hidden"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">Menu</span>
            <div className="space-y-1.5">
              <span className="block h-px w-4 bg-snow" />
              <span className="block h-px w-4 bg-snow" />
            </div>
          </button>
        </div>
      </div>
      {open ? (
        <nav className="border-t border-line bg-ink px-4 py-3 md:hidden">
          <div className="grid gap-2">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-btn px-2 py-2 font-display text-sm text-snow hover:bg-void"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
