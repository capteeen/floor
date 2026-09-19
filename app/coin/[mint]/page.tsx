import { FeeSplitCallout } from "@/components/FeeSplitCallout";
import { FloorCalculator } from "@/components/FloorCalculator";
import { Button } from "@/components/Logo";
import { coins, getCoin, getCollection } from "@/lib/data";
import { formatPct, formatSol, formatUsd } from "@/lib/format";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ mint: string }> };

export async function generateStaticParams() {
  return coins.map((c) => ({ mint: c.mint }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { mint } = await params;
  const coin = getCoin(mint);
  return { title: coin ? `$${coin.ticker}` : "Coin" };
}

export default async function CoinPage({ params }: Props) {
  const { mint } = await params;
  const coin = getCoin(mint);
  if (!coin) notFound();
  const col = getCollection(coin.collectionSlug);

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={coin.image}
            alt=""
            className="h-16 w-16 rounded-full object-cover ring-1 ring-line"
          />
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-mop">Memecoin</p>
            <h1 className="font-display text-4xl font-bold">${coin.ticker}</h1>
            <p className="text-fog">{coin.tagline}</p>
          </div>
        </div>
        <span
          className={`rounded-full border px-3 py-1 font-mono text-[11px] uppercase ${
            coin.graduated ? "border-mop/40 text-mop" : "border-warn/40 text-warn"
          }`}
        >
          {coin.graduated ? "Graduated" : "Bonding"}
        </span>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Mcap" value={formatUsd(coin.mcapUsd)} hint={formatPct(coin.change24h)} />
        <Stat label="24h volume" value={formatUsd(coin.volume24hUsd)} />
        <Stat label="Fees routed to sweep" value={formatSol(coin.feesSweepSol)} />
      </div>

      {!coin.graduated ? (
        <div className="ff-card p-4 md:p-5">
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-fog">Bonding progress</span>
            <span className="font-display text-mop">{coin.bondingPct.toFixed(1)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-void">
            <div className="h-full bg-mop" style={{ width: `${coin.bondingPct}%` }} />
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <FloorCalculator ticker={coin.ticker} floorSol={col?.floorSol ?? 1} />
        {col ? (
          <Link
            href={`/collections/${col.slug}`}
            className="ff-card overflow-hidden transition duration-brand hover:border-mop/40"
          >
            <div className="flex gap-4 p-4">
              <img src={col.cover} alt="" className="h-24 w-24 rounded-card object-cover" />
              <div>
                <p className="text-[11px] uppercase tracking-[0.12em] text-fog">
                  Paired NFT collection
                </p>
                <h2 className="mt-1 font-display text-xl font-semibold">{col.name}</h2>
                <p className="mt-2 font-mono text-sm text-mop">{formatSol(col.floorSol)}</p>
                <p className="mt-1 text-sm text-fog">{col.items.toLocaleString()} items</p>
              </div>
            </div>
          </Link>
        ) : null}
      </div>

      <FeeSplitCallout />

      <div className="flex flex-wrap gap-3">
        <Button href={coin.dexscreenerUrl} variant="secondary">
          View on DexScreener
        </Button>
        <Button href={coin.pumpUrl} variant="ghost">
          pump.fun
        </Button>
      </div>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="ff-card p-4">
      <p className="text-[11px] uppercase tracking-[0.12em] text-fog">{label}</p>
      <p className="mt-2 font-display text-2xl font-semibold">{value}</p>
      {hint ? (
        <p className={`mt-1 text-sm ${hint.startsWith("−") ? "text-hot" : "text-mop"}`}>{hint}</p>
      ) : null}
    </div>
  );
}
