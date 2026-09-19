"use client";

import { FEE_SPLIT } from "@/lib/config";
import { formatSol } from "@/lib/format";
import { useMemo, useState } from "react";

export function FloorCalculator({
  ticker,
  floorSol,
}: {
  ticker: string;
  floorSol: number;
}) {
  const [volume, setVolume] = useState(1000);
  const estimate = useMemo(() => {
    const fees = volume * 0.01;
    const toSweep = fees * (FEE_SPLIT.sweep / 100);
    const floors = floorSol > 0 ? toSweep / floorSol : 0;
    return { toSweep, floors };
  }, [volume, floorSol]);

  return (
    <div className="ff-card p-4 md:p-5">
      <h2 className="font-display font-semibold">Floors / week calculator</h2>
      <p className="mt-1 text-sm text-fog">
        Assumes ~1% creator fees on volume, {FEE_SPLIT.sweep}% routed to the sweep wallet.
      </p>
      <div className="mt-5 flex items-end justify-between">
        <p className="font-display text-4xl font-bold text-mop">{estimate.floors.toFixed(1)}</p>
        <p className="text-sm text-fog">
          {formatSol(estimate.toSweep)} / week into {ticker}’s collection
        </p>
      </div>
      <label className="mt-4 block text-[12px] uppercase tracking-[0.12em] text-fog">
        Estimated weekly volume ({volume.toLocaleString()} SOL)
        <input
          type="range"
          min={100}
          max={5000}
          step={50}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="mt-3 w-full accent-mop"
        />
      </label>
    </div>
  );
}
