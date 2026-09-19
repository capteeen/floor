import { formatNumber, formatPct, formatSol } from "@/lib/format";
import type { Collection } from "@/lib/types";
import Link from "next/link";

export function FloorsTable({ collections }: { collections: Collection[] }) {
  return (
    <section className="ff-card-glass overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
        <h2 className="landing-display text-2xl text-snow md:text-3xl">Floors right now</h2>
        <p className="text-[12px] font-medium text-fog">
          Updated 12s ago <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-mop" />
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-[720px] w-full text-left text-sm">
          <thead className="text-[12px] font-medium text-fog">
            <tr className="border-b border-white/10">
              <th className="px-4 py-3 font-medium">Collection</th>
              <th className="px-4 py-3 font-medium">Floor</th>
              <th className="px-4 py-3 font-medium">24h</th>
              <th className="px-4 py-3 font-medium">Listed</th>
              <th className="px-4 py-3 font-medium">Coins paired</th>
              <th className="px-4 py-3 font-medium">SOL swept</th>
            </tr>
          </thead>
          <tbody>
            {collections.map((col) => (
              <tr key={col.slug} className="border-b border-white/8 last:border-0 transition hover:bg-white/5">
                <td className="px-4 py-3">
                  <Link href={`/collections/${col.slug}`} className="flex items-center gap-3">
                    <img
                      src={col.cover}
                      alt=""
                      className="h-10 w-10 rounded-lg object-cover ring-1 ring-line"
                    />
                    <span>
                      <span className="block font-semibold text-snow">{col.name}</span>
                      <span className="block text-[12px] text-fog">
                        {formatNumber(col.items)} items
                      </span>
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-3 font-editorial font-semibold">{formatSol(col.floorSol)}</td>
                <td className={`px-4 py-3 font-mono text-[13px] ${col.change24h >= 0 ? "text-mop" : "text-hot"}`}>
                  {formatPct(col.change24h)}
                </td>
                <td className="px-4 py-3 text-fog">{col.listed}</td>
                <td className="px-4 py-3 text-fog">{col.coinsPaired}</td>
                <td className="px-4 py-3 font-mono text-[13px] text-snow">{formatSol(col.solSwept)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-white/10 px-5 py-4">
        <Link href="/collections" className="text-sm font-medium text-fog transition hover:text-mop">
          View all collections →
        </Link>
      </div>
    </section>
  );
}
