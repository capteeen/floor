import { AddressChip, TxChip } from "@/components/TxChip";
import { FeeSplitCallout } from "@/components/FeeSplitCallout";
import { SweepCard } from "@/components/SweepCard";
import { coinsForCollection, collections, floorHistory, getCollection, sweepsForCollection } from "@/lib/data";
import { formatNumber, formatPct, formatSol, formatUsd, nftSrc } from "@/lib/format";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CollectionChart } from "@/components/CollectionChart";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return collections.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const col = getCollection(slug);
  return { title: col?.name ?? "Collection" };
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const col = getCollection(slug);
  if (!col) notFound();

  const paired = coinsForCollection(col.slug);
  const receipts = sweepsForCollection(col.slug);
  const history = floorHistory(col.slug);
  const gallery = (col.nftFiles.length ? col.nftFiles : col.files).slice(0, 12);

  return (
    <div className="space-y-6">
      <section className="ff-card overflow-hidden md:grid md:grid-cols-[1.4fr_1fr]">
        <div className="p-5 md:p-7">
          <div className="flex items-start gap-4">
            <img
              src={col.cover}
              alt=""
              className="h-16 w-16 rounded-full object-cover ring-1 ring-line md:h-20 md:w-20"
            />
            <div>
              <h1 className="font-display text-3xl font-bold">{col.name}</h1>
              <p className="mt-1 text-fog">{col.tagline}</p>
            </div>
          </div>
          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <Metric label="Floor" value={formatSol(col.floorSol)} />
            <Metric label="Items" value={formatNumber(col.items)} />
            <Metric label="Owners" value={formatNumber(col.owners)} />
            <Metric label="Volume 7d" value={formatSol(col.volume7d, 1)} />
          </dl>
        </div>
        <div className="relative min-h-[180px] border-t border-line md:border-l md:border-t-0">
          <img src={col.cover} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-ink/80" />
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.9fr]">
        <section className="ff-card p-4 md:p-5">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-fog">Floor price</p>
              <p className="font-display text-3xl font-semibold">
                {formatSol(col.floorSol)}{" "}
                <span className={col.change24h >= 0 ? "text-base text-mop" : "text-base text-hot"}>
                  {formatPct(col.change24h)}
                </span>
              </p>
            </div>
            <p className="font-mono text-[11px] text-fog">Updated 12s ago</p>
          </div>
          <CollectionChart data={history} />
        </section>

        <section className="ff-card p-4 md:p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display font-semibold">Paired memecoins</h2>
            <Link href="/launch" className="text-sm text-mop">
              Launch one
            </Link>
          </div>
          {paired.length === 0 ? (
            <p className="text-sm text-fog">No coin paired yet. Floor’s still dirty.</p>
          ) : (
            <ul className="space-y-3">
              {paired.map((coin) => (
                <li key={coin.mint}>
                  <Link href={`/coin/${coin.mint}`} className="flex items-center justify-between gap-3">
                    <span>
                      <span className="block font-display font-semibold">${coin.ticker}</span>
                      <span className="block text-[12px] text-fog">{coin.name}</span>
                    </span>
                    <span className="text-right text-sm">
                      <span className="block">{formatUsd(coin.mcapUsd)}</span>
                      <span className={coin.change24h >= 0 ? "text-mop" : "text-hot"}>
                        {formatPct(coin.change24h)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <FeeSplitCallout />

      <section className="ff-card p-4 md:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display font-semibold">Sweep wallet</h2>
          <AddressChip address={col.sweepWallet} />
        </div>
        <p className="text-sm text-fog">
          Public. Buys this collection at floor. {receipts.length} receipts on-chain.
        </p>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Recent sweeps</h2>
        </div>
        {receipts.length === 0 ? (
          <div className="ff-card p-8 text-center text-fog">Nothing on the floor yet.</div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {receipts.slice(0, 8).map((sweep) => (
              <SweepCard key={sweep.id} sweep={sweep} />
            ))}
          </div>
        )}
        {receipts[0] ? (
          <p className="mt-3 text-sm text-fog">
            Latest buy tx: <TxChip signature={receipts[0].buyTx} />
          </p>
        ) : null}
      </section>

      {gallery.length ? (
        <section>
          <h2 className="mb-3 font-display text-lg font-semibold">Collection art</h2>
          <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
            {gallery.map((file) => (
              <img
                key={file}
                src={nftSrc(file)}
                alt=""
                className="aspect-square rounded-btn object-cover ring-1 ring-line"
                loading="lazy"
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-[0.12em] text-fog">{label}</dt>
      <dd className="mt-1 font-display text-lg font-semibold">{value}</dd>
    </div>
  );
}
