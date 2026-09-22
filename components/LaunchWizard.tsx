"use client";

import { FeeSplitCallout } from "@/components/FeeSplitCallout";
import { Button } from "@/components/Logo";
import { AddressChip, TxChip } from "@/components/TxChip";
import { appConfig, FEE_SPLIT } from "@/lib/config";
import { collections } from "@/lib/data";
import { cn, formatSol } from "@/lib/format";
import {
  fileFromPreview,
  liveLaunchBlockedReason,
  retryFeeShareLock,
  runLiveLaunch,
  simulateLaunch,
} from "@/lib/launch-client";
import { launchDestinations, validateCoinDetails, type LaunchResult } from "@/lib/launch";
import type { Collection } from "@/lib/types";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
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
  preview: string;
  imageFile: File | null;
};

export function LaunchWizard() {
  const wallet = useWallet();
  const { connection } = useConnection();
  const { setVisible } = useWalletModal();
  const [step, setStep] = useState(0);
  const [collection, setCollection] = useState<Collection | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"low" | "high">("low");
  const [draft, setDraft] = useState<Draft>({ name: "", ticker: "", preview: "", imageFile: null });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [toast, setToast] = useState("");
  const [result, setResult] = useState<LaunchResult | null>(null);
  const [dryConnected, setDryConnected] = useState(false);

  const dest = launchDestinations();
  const liveBlock = liveLaunchBlockedReason();
  const connected = wallet.connected || (appConfig.dryRun && dryConnected);
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
      setError(
        appConfig.dryRun
          ? "Connect a wallet or simulate one to continue."
          : "Connect Phantom or Solflare to launch.",
      );
      return;
    }
    if (step >= 1 && !requireCollection()) return;
    if (step === 2) {
      try {
        validateCoinDetails(draft.name, draft.ticker);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Name and ticker required.");
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
    setStatus("");
    try {
      if (appConfig.dryRun) {
        setStatus("Simulating create + fee lock…");
        const simulated = await simulateLaunch({
          name: draft.name,
          ticker: draft.ticker,
          collectionSlug: collection.slug,
          collectionSweep: collection.sweepWallet,
        });
        setResult(simulated);
        setToast("Floor mopped.");
        return;
      }

      if (!wallet.connected || !wallet.publicKey) {
        throw new Error("Connect Phantom or Solflare to launch live.");
      }
      if (liveBlock) throw new Error(liveBlock);

      const imageFile =
        draft.imageFile ??
        (await fileFromPreview(draft.preview || collection.cover, draft.ticker || collection.slug));

      const live = await runLiveLaunch({
        connection,
        wallet,
        name: draft.name,
        ticker: draft.ticker,
        description: `${draft.name} ($${draft.ticker.toUpperCase()}) paired with ${collection.name} on Sweep. ${FEE_SPLIT.sweep}% of creator fees mop the floor.`,
        website: `https://floorfi.fun/collections/${collection.slug}`,
        imageFile,
        collectionSlug: collection.slug,
        onStatus: setStatus,
      });
      setResult(live);
      setToast(live.feeShareError ? "Coin created — fee split still needs a lock." : "Floor mopped.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Launch failed.");
    } finally {
      setBusy(false);
      setStatus("");
    }
  }

  async function retryLock() {
    if (!result || result.demo) return;
    setBusy(true);
    setError("");
    try {
      const sig = await retryFeeShareLock({
        connection,
        wallet,
        mint: result.mint,
        onStatus: setStatus,
      });
      setResult({ ...result, feeShareSig: sig, feeShareError: undefined });
      setToast("Fee split locked.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fee split lock failed.");
    } finally {
      setBusy(false);
      setStatus("");
    }
  }

  if (result && collection) {
    return (
      <div className="ff-card mx-auto max-w-2xl p-6 md:p-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-mop">
          {result.feeShareError ? "Coin created." : "Floor mopped."}
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold">${draft.ticker.toUpperCase()}</h1>
        <p className="mt-2 text-fog">
          Paired with {collection.name}. Fee split{" "}
          {result.feeShareSig
            ? `locked ${FEE_SPLIT.sweep}/${FEE_SPLIT.protocol}.`
            : "not locked yet."}
        </p>
        {result.demo ? (
          <p className="mt-3 rounded-btn border border-warn/40 bg-warn/10 px-3 py-2 text-sm text-warn">
            Dry-run — nothing landed on Solana.
          </p>
        ) : null}
        {result.feeShareError ? (
          <div className="mt-3 space-y-3 rounded-btn border border-hot/40 bg-hot/10 px-3 py-2 text-sm text-hot">
            <p>Create succeeded, but the 80/20 lock failed: {result.feeShareError}</p>
            <Button onClick={retryLock} disabled={busy}>
              {busy ? status || "Retrying…" : "Retry fee split lock"}
            </Button>
          </div>
        ) : null}
        <div className="mt-6 grid gap-3 text-sm">
          <Row label="Mint" value={<AddressChip address={result.mint} />} />
          <Row label="Sweep wallet" value={<AddressChip address={result.sweepWallet} />} />
          <Row label="Protocol wallet" value={<AddressChip address={result.protocolWallet} />} />
          {result.createSig ? (
            <Row label="Create tx" value={<TxChip signature={result.createSig} />} />
          ) : null}
          {result.feeShareSig ? (
            <Row label="Fee lock tx" value={<TxChip signature={result.feeShareSig} />} />
          ) : null}
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

  const sweepPreview = dest.sweepWallet || collection?.sweepWallet || "—";
  const protocolPreview = dest.protocolWallet || "Not configured";

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

      {appConfig.dryRun ? (
        <p className="mb-6 rounded-btn border border-line px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-fog">
          Dry-run — create is simulated. Flip mainnet to launch on pump.fun.
        </p>
      ) : (
        <p className="mb-6 rounded-btn border border-mop/30 bg-mop/5 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-mop">
          Live — you will sign create, then lock {FEE_SPLIT.sweep}/{FEE_SPLIT.protocol}.
        </p>
      )}

      {step === 0 ? (
        <div className="space-y-4">
          <h1 className="font-display text-2xl font-bold md:text-3xl">Connect wallet</h1>
          <p className="text-fog">
            Phantom or Solflare. You stay the on-chain pump.fun creator — Sweep never holds fee
            authority.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setVisible(true)}>Connect wallet</Button>
            {appConfig.dryRun ? (
              <Button
                variant="secondary"
                onClick={() => {
                  setDryConnected(true);
                  setError("");
                }}
              >
                Simulate wallet
              </Button>
            ) : null}
          </div>
          {wallet.connected ? (
            <p className="font-mono text-sm text-mop">Wallet connected.</p>
          ) : dryConnected ? (
            <p className="font-mono text-sm text-warn">Simulated wallet (dry-run).</p>
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
                    setDraft((d) => ({
                      ...d,
                      preview: d.preview && d.imageFile ? d.preview : col.cover,
                    }));
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
                maxLength={32}
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
                  const preview = URL.createObjectURL(file);
                  setDraft((d) => {
                    if (d.preview.startsWith("blob:")) URL.revokeObjectURL(d.preview);
                    return { ...d, imageFile: file, preview };
                  });
                }}
              />
            </label>
          </div>
          <div className="ff-card overflow-hidden">
            <img
              src={draft.preview || collection?.cover || "/svg/sweep-mark.svg"}
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
            for {collection?.name}. 20% to Sweep protocol.
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
                <p className="mt-2">
                  <AddressChip address={sweepPreview} />
                </p>
              </div>
              <div className="border-l border-line p-4">
                <p className="text-fog">Sweep protocol</p>
                <p className="font-display text-2xl font-bold">{FEE_SPLIT.protocol}%</p>
                <p className="mt-2 text-[12px] text-fog">
                  {dest.protocolWallet ? <AddressChip address={protocolPreview} /> : protocolPreview}
                </p>
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
              <li>
                Mode:{" "}
                <span className="text-snow">
                  {appConfig.dryRun
                    ? "Dry-run simulate"
                    : "Live pump.fun — two signatures (create, then fee lock)"}
                </span>
              </li>
            </ul>
          )}
          {liveBlock ? <p className="text-sm text-hot">{liveBlock}</p> : null}
          <FeeSplitCallout compact />
          <Button onClick={launch} disabled={!collection || busy || Boolean(liveBlock)}>
            {busy ? status || "Signing…" : appConfig.dryRun ? "Simulate create →" : "Create coin →"}
          </Button>
        </div>
      ) : null}

      {error ? <p className="mt-4 text-sm text-hot">{error}</p> : null}

      <div className="mt-8 flex items-center justify-between gap-3">
        <Button variant="secondary" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>
          Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={next} disabled={(step === 0 && !connected) || (step >= 1 && !collection)}>
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
