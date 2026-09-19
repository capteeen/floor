import { FeeSplitCallout } from "@/components/FeeSplitCallout";
import { Button } from "@/components/Logo";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Docs" };

export default function DocsPage() {
  return (
    <article className="prose-invert mx-auto max-w-2xl space-y-6">
      <h1 className="font-display text-3xl font-bold md:text-4xl">How Floorfi works</h1>
      <p className="text-lg text-fog">
        Launch a memecoin. Pair it with an NFT collection. Lock an 80/20 fee split. The public sweep
        wallet buys the floor — and posts the receipt.
      </p>

      <FeeSplitCallout />

      <section className="space-y-2">
        <h2 className="font-display text-xl font-semibold">1. Pair is required</h2>
        <p className="text-fog">
          You cannot launch without picking a Solana NFT collection. Volume has somewhere to mop.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-display text-xl font-semibold">2. Fee split is locked</h2>
        <p className="text-fog">
          At create time we set pump.fun fee shares to 80% collection sweep wallet / 20% Floorfi
          protocol, then revoke admin so it cannot change. You remain the on-chain creator. Floorfi
          never holds fee authority.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-display text-xl font-semibold">3. Public sweep wallet</h2>
        <p className="text-fog">
          One wallet per collection. It buys listings at floor. The gallery only shows NFTs with a
          purchase transaction, mint, and wallet — linked on Solscan.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-display text-xl font-semibold">4. Receipts or it didn’t happen</h2>
        <p className="text-fog">
          Every sweep is a Solana transaction with a Solscan link — purchase tx, mint, and wallet.
          Floor prices come from Magic Eden / Tensor, with a timestamp.
        </p>
      </section>

      <Button href="/launch">Launch on Floorfi</Button>
    </article>
  );
}
