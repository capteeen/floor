import { Button } from "@/components/Logo";
import { FloorsTable } from "@/components/FloorsTable";
import { LandingHero } from "@/components/LandingHero";
import { SweepCard } from "@/components/SweepCard";
import { protocolStats, rankedFloors, sweeps } from "@/lib/data";
import { formatNumber, formatSol } from "@/lib/format";

export default function HomePage() {
  const floors = rankedFloors();
  const recent = sweeps.slice(0, 8);

  return (
    <div className="landing-page pb-4">
      <div className="px-3 pt-3 md:px-4 md:pt-4">
        <LandingHero />
      </div>

      <div className="mx-auto mt-10 w-full max-w-6xl space-y-10 px-4 md:mt-14">
        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Coins launched" value={formatNumber(protocolStats.coinsLaunched)} />
          <Stat label="Collections" value={formatNumber(protocolStats.collections)} />
          <Stat label="NFTs swept" value={formatNumber(protocolStats.nftsSwept)} />
          <Stat label="SOL swept" value={formatSol(protocolStats.solSwept)} />
        </section>

        <FloorsTable collections={floors} />

        <section>
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <h2 className="landing-display text-3xl text-snow md:text-4xl">Recent sweeps</h2>
              <p className="mt-1 text-sm text-fog">Receipts or it didn’t happen.</p>
            </div>
            <Button href="/sweeps" variant="ghost">
              All sweeps →
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {recent.map((sweep) => (
              <SweepCard key={sweep.id} sweep={sweep} className="ff-card-glass border-0" />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="ff-card-glass px-4 py-5">
      <p className="text-[12px] font-medium text-fog">{label}</p>
      <p className="landing-display mt-2 text-2xl text-snow md:text-3xl">{value}</p>
    </div>
  );
}
