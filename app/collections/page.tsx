import { formatNumber, formatSol } from "@/lib/format";
import { collections } from "@/lib/data";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Collections" };

export default function CollectionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold md:text-4xl">Collections</h1>
        <p className="mt-1 text-fog">Every Floorfi coin is paired with one of these.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((col) => (
          <Link
            key={col.slug}
            href={`/collections/${col.slug}`}
            className="ff-card overflow-hidden transition duration-brand hover:border-mop/40"
          >
            <div className="relative aspect-[16/9]">
              <img src={col.cover} alt="" className="h-full w-full object-cover" />
              <span className="absolute bottom-2 left-2 rounded-full bg-void/80 px-2 py-1 font-mono text-[11px] text-mop">
                {formatSol(col.floorSol)}
              </span>
            </div>
            <div className="p-4">
              <h2 className="font-display text-lg font-semibold">{col.name}</h2>
              <p className="mt-1 text-sm text-fog">{col.tagline}</p>
              <p className="mt-3 text-[12px] text-fog">
                {formatNumber(col.items)} items · {col.coinsPaired} coins · {col.listed} listed
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
