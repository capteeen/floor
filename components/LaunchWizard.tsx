"use client";

import { FeeSplitCallout } from "@/components/FeeSplitCallout";
import { Button } from "@/components/Logo";
import { AddressChip } from "@/components/TxChip";
import { FEE_SPLIT } from "@/lib/config";
import { collections } from "@/lib/data";
import { cn, fakePubkey, formatSol } from "@/lib/format";
import type { Collection } from "@/lib/types";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useMemo, useState, type ReactNode } from "react";

const STEPS = [
  "Connect wallet",
  "Pick collection",
  "Coin details",
  "Fee split preview",
  "Confirm",
] as const;

type Draft = {
  name: string;
  ticker: string;
  image: string;
};

export function LaunchWizard() {
  const wallet = useWallet();
  const { setVisible } = useWalletModal();
  const [step, setStep] = useState(0);
  const [collection, setCollection] = useState<Collection | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"low" | "high">("low");
  const [draft, setDraft] = useState<Draft>({ name: "", ticker: "", image: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [result, setResult] = useState<{
    mint: string;
    sweepWallet: string;
  } | null>(null);
  const [dryConnected, setDryConnected] = useState(false);

  const connected = wallet.connected || dryConnected;
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = collections.filter(
      (c) => !q || c.name.toLowerCase().includes(q) || c.slug.includes(q),
    );
    return [...list].sort((a, b) =>
      sort === "low" ? a.floorSol - b.floorSol : b.floorSol - a.floorSol,
    );
  }, [query, sort]);

  function requireCollection() {
    if (!collection) {
      setError("Pick a collection first. No collection, no launch.");
      return false;
    }
    setError("");
    return true;
  }

  function next() {
    if (step === 0 && !connected) {
      setDryConnected(true);
    }
    if (step >= 1 && !requireCollection()) return;
    if (step === 2) {
      if (!draft.name.trim() || !draft.ticker.trim()) {
        setError("Name and ticker required.");
        return;
      }
    }
    setError("");
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  async function launch() {
    if (!requireCollection() || !collection) return;
    setBusy(true);
    setError("");
    try {
      await new Promise((r) => setTimeout(r, 700));
      setResult({
        mint: fakePubkey(`mint:${draft.ticker}:${collection.slug}`),
        sweepWallet: collection.sweepWallet,
      });
      setToast("Floor mopped.");
    } finally {
      setBusy(false);
    }
  }

  if (result && collection) {
    return (
      <div className="ff-card mx-auto max-w-2xl p-6 md:p-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-mop">Floor mopped.</p>
        <h1 className="mt-2 font-display text-3xl font-bold">${draft.ticker.toUpperCase()}</h1>
        <p className="mt-2 text-fog">
          Paired with {collection.name}. Fee split locked {FEE_SPLIT.sweep}/{FEE_SPLIT.protocol}.
        </p>
        <div className="mt-6 grid gap-3 text-sm">
          <Row label="Sweep wallet" value={<AddressChip address={result.sweepWallet} />} />
          <Row
            label="pump.fun"
            value={
              <a
                className="text-mop hover:underline"
                href={`https://pump.fun/coin/${result.mint}`}
                target="_blank"
                rel="noreferrer"
              >
                Open
              </a>
            }
          />
          <Row
            label="DexScreener"
            value={
              <a
                className="text-mop hover:underline"
                href={`https://dexscreener.com/solana/${result.mint}`}
                target="_blank"
                rel="noreferrer"
              >
                Open
              </a>
            }
          />
        </div>
        <FeeSplitCallout className="mt-6" compact />
        <div className="mt-6 flex flex-wrap gap-3">
          <Button href={`/collections/${collection.slug}`}>View collection</Button>
          <Button href="/sweeps" variant="secondary">
            See sweeps
          </Button>
        </div>
        {toast ? (
          <p className="mt-4 font-display text-sm text-mop" role="status">
            {toast}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="ff-card mx-auto max-w-5xl p-4 md:p-8">
      <ol className="mb-8 flex flex-wrap items-center gap-2 text-[12px] text-fog md:gap-4">
        {STEPS.map((label, i) => (
          <li key={label} className="flex items-center gap-2">
            <span
              className={cn(
                "grid h-7 w-7 place-items-center rounded-full border font-display text-[12px] font-semibold",
                i === step
                  ? "border-mop bg-mop text-void"
                  : i < step
                    ? "border-mop/40 text-mop"
                    : "border-line text-fog",
              )}
            >
              {i + 1}
            </span>
            <span className={cn("hidden sm:inline", i === step && "text-mop")}>{label}</span>
            {i < STEPS.length - 1 ? <span className="hidden h-px w-6 bg-line md:block" /> : null}
          </li>
        ))}
      </ol>

      {step === 0 ? (
        <div className="space-y-4">
          <h1 className="font-display text-2xl font-bold md:text-3xl">Connect wallet</h1>
          <p className="text-fog">
            Phantom or Solflare. You stay the on-chain pump.fun creator — Floorfi never holds fee
            authority.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setVisible(true)}>Connect wallet</Button>
          </div>
          {connected ? (
            <p className="font-mono text-sm text-mop">Wallet connected.</p>
          ) : null}
        </div>
      ) : null}

      {step === 1 ? (
        <div className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-bold md:text-3xl">Pick collection</h1>
              <p className="text-fog">Required. No coin launches without a pair.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search collections"
                className="h-10 rounded-btn border border-line bg-void px-3 text-sm outline-none ring-mop/40 placeholder:text-fog focus:ring-2"
              />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as "low" | "high")}
                className="h-10 rounded-btn border border-line bg-void px-3 text-sm"
              >
                <option value="low">Floor: low to high</option>
                <option value="high">Floor: high to low</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {filtered.map((col) => {
              const selected = collection?.slug === col.slug;
              return (
                <button
                  key={col.slug}
                  type="button"
                  onClick={() => {
                    setCollection(col);
                    setError("");
                    if (!draft.image) setDraft((d) => ({ ...d, image: col.cover }));
                  }}
                  className={cn(
                    "ff-card overflow-hidden text-left transition duration-brand hover:border-mop/40",
                    selected && "border-mop shadow-mop",
                  )}
                >
                  <div className="relative aspect-[4/3]">
                    <img src={col.cover} alt="" className="h-full w-full object-cover" />
                    {selected ? (
                      <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-mop text-void">
                        ✓
                      </span>
                    ) : null}
                  </div>
                  <div className="p-3">
                    <p className="font-display text-sm font-semibold">{col.name}</p>
                    <p className="text-[12px] text-fog">{col.items.toLocaleString()} items</p>
                    <p className="mt-1 font-mono text-[12px] text-mop">{formatSol(col.floorSol)}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="grid gap-6 md:grid-cols-[1fr_220px]">
          <div className="space-y-4">
            <h1 className="font-display text-2xl font-bold">Coin details</h1>
            <label className="block text-sm text-fog">
              Name
              <input
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                className="mt-1 h-11 w-full rounded-btn border border-line bg-void px-3 text-snow outline-none focus:border-mop"
              />
            </label>
            <label className="block text-sm text-fog">
              Ticker
              <input
                value={draft.ticker}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, ticker: e.target.value.toUpperCase().slice(0, 10) }))
                }
                className="mt-1 h-11 w-full rounded-btn border border-line bg-void px-3 font-mono text-snow outline-none focus:border-mop"
              />
            </label>
            <label className="block text-sm text-fog">
              Image
              <input
                type="file"
                accept="image/*"
                className="mt-1 block w-full text-sm"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () =>
                    setDraft((d) => ({ ...d, image: String(reader.result) }));
                  reader.readAsDataURL(file);
                }}
              />
            </label>
          </div>
          <div className="ff-card overflow-hidden">
            <img
              src={draft.image || collection?.cover || "/svg/floorfi-mark.svg"}
              alt=""
              className="aspect-square w-full object-cover"
            />
            <p className="p-3 text-xs text-fog">Preview uses upload or collection cover.</p>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="space-y-5">
          <h1 className="font-display text-2xl font-bold">Fee split preview</h1>
          <p className="text-fog">
            This cannot change after launch. 80% of creator fees route to the public sweep wallet
            for {collection?.name}. 20% to Floorfi protocol.
          </p>
          <div className="overflow-hidden rounded-card border border-line">
            <div className="flex h-4">
              <div className="w-4/5 bg-mop" />
              <div className="w-1/5 bg-mop-dim" />
            </div>
            <div className="grid grid-cols-2 text-sm">
              <div className="p-4">
                <p className="text-fog">Sweep wallet</p>
                <p className="font-display text-2xl font-bold text-mop">{FEE_SPLIT.sweep}%</p>
              </div>
              <div className="border-l border-line p-4">
                <p className="text-fog">Floorfi protocol</p>
                <p className="font-display text-2xl font-bold">{FEE_SPLIT.protocol}%</p>
              </div>
            </div>
          </div>
          <FeeSplitCallout />
        </div>
      ) : null}

      {step === 4 ? (
        <div className="space-y-5">
          <h1 className="font-display text-2xl font-bold">Confirm</h1>
          {!collection ? (
            <p className="text-hot">Cannot launch without a collection.</p>
          ) : (
            <ul className="space-y-2 text-sm text-fog">
              <li>
                Coin:{" "}
                <span className="text-snow">
                  {draft.name} (${draft.ticker})
                </span>
              </li>
              <li>
                Collection: <span className="text-snow">{collection.name}</span>
              </li>
              <li>
                Split:{" "}
                <span className="text-mop">
                  locked {FEE_SPLIT.sweep}/{FEE_SPLIT.protocol}
                </span>
              </li>
            </ul>
          )}
          <FeeSplitCallout compact />
          <Button onClick={launch} disabled={!collection || busy}>
            {busy ? "Signing…" : "Create coin →"}
          </Button>
        </div>
      ) : null}

      {error ? <p className="mt-4 text-sm text-hot">{error}</p> : null}

      <div className="mt-8 flex items-center justify-between gap-3">
        <Button variant="secondary" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>
          Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button
            onClick={next}
            disabled={step >= 1 && !collection}
          >
            Continue →
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-btn border border-line px-3 py-2">
      <span className="text-fog">{label}</span>
      <span>{value}</span>
    </div>
  );
}
