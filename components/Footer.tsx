import { FeeSplitCallout } from "@/components/FeeSplitCallout";
import { Logo } from "@/components/Logo";
import { appConfig } from "@/lib/config";
import { truncateMiddle } from "@/lib/format";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-[1.2fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-md text-sm leading-relaxed text-fog">
            Memecoins that mop the floor. Pair a coin with a collection. Lock 80/20. Watch a
            public sweep wallet buy the floor — receipts on Solscan.
          </p>
        </div>
        <div className="grid gap-3 text-sm text-fog">
          <FeeSplitCallout compact />
          {appConfig.protocolFeeWallet ? (
            <p className="font-mono text-[12px]">
              Protocol wallet: {truncateMiddle(appConfig.protocolFeeWallet, 6, 6)}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-4">
            <Link href="/docs" className="hover:text-mop">
              How it works
            </Link>
            <Link href="/sweeps" className="hover:text-mop">
              Sweeps
            </Link>
            <Link href="/launch" className="hover:text-mop">
              Launch
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
