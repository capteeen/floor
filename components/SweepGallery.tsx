"use client";

import { SweepCard } from "@/components/SweepCard";
import { collections, sweeps } from "@/lib/data";
import { useMemo, useState } from "react";

export function SweepGallery() {
  const [slug, setSlug] = useState("all");
  const [status, setStatus] = useState<"all" | "held" | "burned">("all");

  const filtered = useMemo(() => {
    return sweeps.filter((s) => {
      if (slug !== "all" && s.collectionSlug !== slug) return false;
      if (status === "held" && !s.held) return false;
      if (status === "burned" && s.held) return false;
      return true;
    });
  }, [slug, status]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold md:text-4xl">Sweeps</h1>
          <p className="mt-1 text-fog">Receipts or it didn’t happen.</p>
        </div>
        <p className="font-mono text-[12px] text-fog">{filtered.length} sweeps</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="h-10 rounded-btn border border-line bg-ink px-3 text-sm"
        >
          <option value="all">All collections</option>
          {collections.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
          className="h-10 rounded-btn border border-line bg-ink px-3 text-sm"
        >
          <option value="all">Held + burned</option>
          <option value="held">Held</option>
          <option value="burned">Burned</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="ff-card grid place-items-center px-6 py-16 text-center">
          <p className="font-display text-xl">Nothing on the floor yet.</p>
          <p className="mt-2 text-fog">Floor’s still dirty. Be the first coin.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {filtered.map((sweep) => (
            <SweepCard key={sweep.id} sweep={sweep} />
          ))}
        </div>
      )}
    </div>
  );
}
