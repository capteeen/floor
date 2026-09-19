"use client";

import { FeeSplitCallout } from "@/components/FeeSplitCallout";
import { collections, protocolStats, protocolSweepSeries } from "@/lib/data";
import { formatNumber, formatSol } from "@/lib/format";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function AnalyticsView() {
  const series = protocolSweepSeries();
  const top = [...collections].sort((a, b) => b.solSwept - a.solSwept).slice(0, 6);
  const max = top[0]?.solSwept ?? 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold md:text-4xl">Analytics</h1>
        <p className="mt-1 text-fog">Real-time on-chain sweep intelligence.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card label="SOL swept" value={formatSol(protocolStats.solSwept)} />
        <Card label="NFTs mopped" value={formatNumber(protocolStats.nftsSwept)} />
        <Card label="Coins launched" value={formatNumber(protocolStats.coinsLaunched)} />
        <Card label="Collections" value={formatNumber(protocolStats.collections)} />
      </div>

      <section className="ff-card p-4 md:p-5">
        <h2 className="mb-4 font-display font-semibold">SOL swept over 30 days</h2>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series}>
              <XAxis dataKey="label" hide />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  background: "#0E1018",
                  border: "1px solid #1C2030",
                  borderRadius: 12,
                }}
                formatter={(value) => [formatSol(Number(value), 0), "SOL"]}
              />
              <Line type="monotone" dataKey="sol" stroke="#3DFF9A" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="ff-card p-4 md:p-5">
        <h2 className="mb-4 font-display font-semibold">Top collections by sweep volume</h2>
        <ul className="space-y-3">
          {top.map((col, i) => (
            <li key={col.slug} className="flex items-center gap-3">
              <span className="w-5 font-mono text-fog">{i + 1}</span>
              <img src={col.cover} alt="" className="h-8 w-8 rounded-full object-cover" />
              <span className="flex-1 font-display text-sm">{col.name}</span>
              <div className="hidden h-2 w-40 overflow-hidden rounded-full bg-void sm:block">
                <div className="h-full bg-mop" style={{ width: `${(col.solSwept / max) * 100}%` }} />
              </div>
              <span className="w-28 text-right font-mono text-[12px]">{formatSol(col.solSwept)}</span>
            </li>
          ))}
        </ul>
      </section>

      <FeeSplitCallout />
      <p className="text-sm text-fog">
        Methodology: 80% of creator fees route to public sweep wallets and buy the paired collection
        at floor. Every buy is a Solana transaction — receipts or it didn’t happen.
      </p>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="ff-card p-4">
      <p className="text-[11px] uppercase tracking-[0.12em] text-fog">{label}</p>
      <p className="mt-2 font-display text-2xl font-semibold">{value}</p>
    </div>
  );
}
