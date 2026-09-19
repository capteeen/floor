import { HeroGallery } from "@/components/HeroGallery";
import { LandingNav } from "@/components/LandingNav";
import { LandingPulse } from "@/components/LandingPulse";
import { collections, protocolStats, rankedFloors, sweeps } from "@/lib/data";
import { formatNumber, formatSol } from "@/lib/format";
import Link from "next/link";

const CHIP_SLUGS = ["mad_lads", "claynosaurz", "degods"] as const;

export function LandingHero() {
  const featured = CHIP_SLUGS.map((slug) => collections.find((c) => c.slug === slug)).filter(
    Boolean,
  ) as typeof collections;
  const faces = rankedFloors().slice(0, 3);
  const story = sweeps[0];

  return (
    <section className="landing-stage">
      <HeroGallery />
      <div className="landing-wash pointer-events-none absolute inset-0 z-[1]" />

      <LandingNav />

      <div className="pointer-events-none relative z-10 flex min-h-[calc(100dvh-1.5rem)] flex-col justify-between px-5 pb-5 pt-20 md:min-h-[calc(100dvh-2rem)] md:px-10 md:pb-7 md:pt-24">
        <div className="ff-rise max-w-xl">
          <h1 className="landing-display text-[2.45rem] leading-[0.98] text-snow sm:text-5xl md:text-[4.05rem]">
            Memecoins that
            <span className="mt-1 block text-mop">mop the floor</span>
            <span className="mt-1 block">for your collection.</span>
          </h1>
          <p className="ff-rise mt-6 inline-flex items-center gap-2 text-[13px] font-medium text-snow/80 md:text-sm" style={{ animationDelay: "90ms" }}>
            <span className="grid h-5 w-5 place-items-center rounded-full bg-mop text-void">
              <CheckIcon />
            </span>
            {formatNumber(protocolStats.nftsSwept)}+ NFTs swept in public
          </p>
        </div>

        <div className="grid min-w-0 gap-3 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.1fr)_minmax(0,1.15fr)] md:items-stretch md:gap-4">
          <article className="ff-glass-snow pointer-events-auto ff-rise rounded-[28px] p-6 md:p-7" style={{ animationDelay: "140ms" }}>
            <h2 className="landing-display text-[1.85rem] leading-[1.05] text-void md:text-[2.15rem]">
              80/20
              <span className="mt-1 block">whole-floor split</span>
            </h2>
            <div className="mt-8 flex items-end justify-between gap-3">
              <p className="max-w-[9rem] text-[13px] leading-snug text-void/55">
                Locked at launch. {formatNumber(protocolStats.collections)} collections paired.
              </p>
              <div className="flex -space-x-2">
                {faces.map((col) => (
                  <img
                    key={col.slug}
                    src={col.cover}
                    alt={col.name}
                    className="h-9 w-9 rounded-full object-cover ring-2 ring-snow"
                  />
                ))}
              </div>
            </div>
          </article>

          <article className="ff-glass pointer-events-auto ff-rise rounded-[28px]" style={{ animationDelay: "200ms" }}>
            <LandingPulse />
          </article>

          <article className="pointer-events-auto ff-rise overflow-hidden rounded-[28px]" style={{ animationDelay: "260ms" }}>
            <Link href="/sweeps" className="group relative block h-full min-h-[11.5rem] overflow-hidden rounded-[28px]">
              <img
                src={story.image}
                alt={story.tokenName}
                className="absolute inset-0 h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-void/80 via-void/15 to-transparent" />
              <div className="absolute inset-x-3 bottom-3">
                <div className="ff-glass-float rounded-2xl p-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={faces[0]?.cover ?? story.image}
                      alt=""
                      className="h-9 w-9 rounded-full object-cover ring-1 ring-white/20"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] leading-snug text-snow/90">
                        Swept {story.collectionName} at {formatSol(story.solPaid)}.
                      </p>
                      <p className="mt-1 text-[11px] text-mop">{formatSol(story.floorAtBuy)} floor</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-white/10 px-2 py-1 text-[11px] font-medium text-snow/80">
                      {formatNumber(protocolStats.nftsSwept)}+
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </article>
        </div>
      </div>

      <Link
        href="/launch"
        className="ff-orb-cta pointer-events-auto absolute left-1/2 top-[42%] z-20 hidden h-[7.6rem] w-[7.6rem] -translate-x-[12%] -translate-y-1/2 flex-col items-center justify-center rounded-full text-center font-landing text-[15px] font-semibold leading-tight md:flex"
      >
        Launch
        <span className="block text-[13px] font-medium opacity-80">coin</span>
      </Link>

      <div className="pointer-events-none absolute right-[7%] top-[34%] z-20 hidden flex-col gap-8 lg:flex">
        {featured.map((col, index) => (
          <Link
            key={col.slug}
            href={`/collections/${col.slug}`}
            className="pointer-events-auto ff-rise ff-glass-float inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-medium text-snow/90 transition duration-200 ease-out hover:bg-white/10"
            style={{ animationDelay: `${180 + index * 80}ms` }}
          >
            <span className="relative grid h-5 w-5 place-items-center">
              <span className="h-2 w-2 rounded-full bg-snow/80 ring-4 ring-white/15" />
            </span>
            {col.name}
          </Link>
        ))}
      </div>
    </section>
  );
}

function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path
        d="M2.2 6.2 4.7 8.6 9.8 3.4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
