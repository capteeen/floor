import { TxChip } from "@/components/TxChip";
import { cn, formatSol } from "@/lib/format";
import type { SweepReceipt } from "@/lib/types";
import Link from "next/link";

export function SweepCard({ sweep, className }: { sweep: SweepReceipt; className?: string }) {
  return (
    <article className={cn("ff-card overflow-hidden", className)}>
      <div className="relative aspect-square bg-void">
        <img
          src={sweep.image}
          alt={sweep.tokenName}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute left-2 top-2 flex items-center gap-1.5">
          <span className="rounded-full bg-mop px-2 py-0.5 font-display text-[10px] font-bold uppercase tracking-wide text-void">
            Swept
          </span>
        </div>
        {!sweep.held ? (
          <span className="absolute right-2 top-2 rounded-full border border-hot/50 bg-void/80 px-2 py-0.5 font-mono text-[10px] uppercase text-hot">
            Burned
          </span>
        ) : null}
      </div>
      <div className="space-y-2 p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="font-display text-sm font-semibold text-mop">{formatSol(sweep.solPaid)}</p>
          <Link
            href={`/collections/${sweep.collectionSlug}`}
            className="truncate text-[12px] text-fog hover:text-snow"
          >
            {sweep.collectionName}
          </Link>
        </div>
        <p className="truncate text-[12px] text-fog">{sweep.tokenName}</p>
        <TxChip signature={sweep.buyTx} />
      </div>
    </article>
  );
}
