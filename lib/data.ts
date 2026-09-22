import raw from "@/nft-images/collections.json";
import { appConfig } from "@/lib/config";
import { coverSrc, fakePubkey, fakeSig, hashString, nftSrc } from "@/lib/format";
import type { Coin, Collection, SweepReceipt } from "@/lib/types";

type RawJson = {
  collections: { slug: string; name: string; files: string[] }[];
  images: { file: string; slug: string; name: string; bytes: number }[];
};

const catalog = raw as RawJson;

const COVER_FILES: Record<string, string> = {
  aurory: "aurory.png",
  blocksmith_labs: "blocksmith_labs.jpeg",
  cets_on_creck: "cets_on_creck.png",
  claynosaurz: "claynosaurz.jpeg",
  degenerate_ape_academy: "degenerate_ape_academy.webp",
  degods: "degods.png",
  famous_fox_federation: "famous_fox_federation.gif",
  frogana: "frogana.webp",
  ghost_kid_dao: "ghost_kid_dao.png",
  mad_lads: "mad_lads.png",
  nyan_heroes: "nyan_heroes.png",
  okay_bears: "okay_bears.png",
  smb: "smb.png",
  tensorians: "tensorians.gif",
  y00ts: "y00ts.png",
};

const META: Record<
  string,
  {
    name: string;
    tagline: string;
    floorSol: number;
    items: number;
    listed: number;
    change24h: number;
  }
> = {
  claynosaurz: {
    name: "Claynosaurz",
    tagline: "Jurassic drip, mopped daily.",
    floorSol: 12.4,
    items: 10000,
    listed: 41,
    change24h: 5.2,
  },
  degods: {
    name: "DeGods",
    tagline: "Gods that still pay rent on the floor.",
    floorSol: 8.91,
    items: 10000,
    listed: 38,
    change24h: 3.1,
  },
  mad_lads: {
    name: "Mad Lads",
    tagline: "The maddest bunch on Solana.",
    floorSol: 155,
    items: 4444,
    listed: 23,
    change24h: 12.45,
  },
  blocksmith_labs: {
    name: "Blocksmith Labs",
    tagline: "Forged, then swept.",
    floorSol: 0.39,
    items: 2222,
    listed: 17,
    change24h: -1.3,
  },
  famous_fox_federation: {
    name: "Famous Fox Federation",
    tagline: "Sly volume. Cleaner floors.",
    floorSol: 4.22,
    items: 3333,
    listed: 28,
    change24h: 2.8,
  },
  okay_bears: {
    name: "Okay Bears",
    tagline: "Okay coin. Not-okay floor pressure.",
    floorSol: 6.38,
    items: 10000,
    listed: 35,
    change24h: -2.1,
  },
  y00ts: {
    name: "y00ts",
    tagline: "Cute until the mop arrives.",
    floorSol: 3.17,
    items: 15000,
    listed: 44,
    change24h: 1.7,
  },
  aurory: {
    name: "Aurory",
    tagline: "Quest complete: floor down.",
    floorSol: 2.08,
    items: 8888,
    listed: 31,
    change24h: 4.4,
  },
  cets_on_creck: {
    name: "Cets on Creck",
    tagline: "Cets. Creck. Collection paired.",
    floorSol: 0.72,
    items: 6969,
    listed: 52,
    change24h: 6.1,
  },
  degenerate_ape_academy: {
    name: "Degenerate Ape Academy",
    tagline: "Academy grads, floor dropouts.",
    floorSol: 0.89,
    items: 10000,
    listed: 48,
    change24h: 0.9,
  },
  frogana: {
    name: "Frogana",
    tagline: "Ribbit. Sweep. Repeat.",
    floorSol: 1.14,
    items: 1502,
    listed: 19,
    change24h: 4.9,
  },
  ghost_kid_dao: {
    name: "Ghost Kid DAO",
    tagline: "Haunting the asks.",
    floorSol: 0.51,
    items: 3333,
    listed: 26,
    change24h: -0.8,
  },
  nyan_heroes: {
    name: "Nyan Heroes",
    tagline: "Heroes mop, villains list.",
    floorSol: 0.44,
    items: 5555,
    listed: 33,
    change24h: 2.2,
  },
  smb: {
    name: "Solana Monkey Business",
    tagline: "OG monkeys, public receipts.",
    floorSol: 0.65,
    items: 5000,
    listed: 29,
    change24h: 1.4,
  },
  tensorians: {
    name: "Tensorians",
    tagline: "Marketplace natives, floor bait.",
    floorSol: 1.88,
    items: 10000,
    listed: 40,
    change24h: 3.6,
  },
};

const filesBySlug = new Map<string, string[]>();
for (const col of catalog.collections) {
  filesBySlug.set(col.slug, col.files);
}

function nftOnly(files: string[]) {
  return files.filter((file) => file.startsWith("nft-"));
}

function ownersFor(slug: string, items: number) {
  const h = hashString(slug);
  return Math.max(200, Math.round(items * (0.42 + (h % 28) / 100)));
}

export const collections: Collection[] = Object.entries(META).map(([slug, meta]) => {
  const files = filesBySlug.get(slug) ?? [];
  const nfts = nftOnly(files);
  const h = hashString(slug);
  const coinsPaired = 1 + (h % 4);
  const sweeps24h = 12 + (h % 140);
  const solSwept = Number((meta.floorSol * (8 + (h % 20)) + (h % 90)).toFixed(2));
  const coverFile = COVER_FILES[slug];
  const cover = coverFile
    ? coverSrc(coverFile)
    : files[0]
      ? nftSrc(files[0])
      : coverSrc("mad_lads.png");

  return {
    slug,
    name: meta.name,
    tagline: meta.tagline,
    items: meta.items,
    owners: ownersFor(slug, meta.items),
    floorSol: meta.floorSol,
    listed: meta.listed,
    change24h: meta.change24h,
    volume7d: Number((meta.floorSol * meta.listed * (2 + (h % 7))).toFixed(1)),
    coinsPaired,
    sweeps24h,
    solSwept,
    cover,
    files,
    nftFiles: nfts.length ? nfts : files,
    sweepWallet: fakePubkey(`sweep:${slug}`),
  };
});

const collectionBySlug = new Map(collections.map((c) => [c.slug, c]));

const COIN_SEED: Array<{
  mint: string;
  name: string;
  ticker: string;
  tagline: string;
  collectionSlug: string;
  bondingPct: number;
  graduated: boolean;
}> = [
  {
    mint: "mopfloor1111111111111111111111111111111111",
    name: "Mop",
    ticker: "MOP",
    tagline: "The mop that cleans up SOL.",
    collectionSlug: "mad_lads",
    bondingPct: 72.4,
    graduated: false,
  },
  {
    mint: "bucket22222222222222222222222222222222222",
    name: "Bucket",
    ticker: "BCKT",
    tagline: "Where the floor water goes.",
    collectionSlug: "claynosaurz",
    bondingPct: 100,
    graduated: true,
  },
  {
    mint: "suds3333333333333333333333333333333333333",
    name: "Suds",
    ticker: "SUDS",
    tagline: "Foam now. Floor later.",
    collectionSlug: "okay_bears",
    bondingPct: 41.2,
    graduated: false,
  },
  {
    mint: "bristles444444444444444444444444444444444",
    name: "Bristles",
    ticker: "BRST",
    tagline: "Scrub the asks.",
    collectionSlug: "degods",
    bondingPct: 88.1,
    graduated: false,
  },
  {
    mint: "janitor5555555555555555555555555555555555",
    name: "Janitor",
    ticker: "JTR",
    tagline: "Smug. On-chain. Employed.",
    collectionSlug: "famous_fox_federation",
    bondingPct: 100,
    graduated: true,
  },
  {
    mint: "squeegee666666666666666666666666666666666",
    name: "Squeegee",
    ticker: "SQG",
    tagline: "Streak-free floors.",
    collectionSlug: "y00ts",
    bondingPct: 19.6,
    graduated: false,
  },
  {
    mint: "wetfloor777777777777777777777777777777777",
    name: "Wet Floor",
    ticker: "WET",
    tagline: "Caution: volume ahead.",
    collectionSlug: "blocksmith_labs",
    bondingPct: 55.0,
    graduated: false,
  },
  {
    mint: "dustpan8888888888888888888888888888888888",
    name: "Dustpan",
    ticker: "DUST",
    tagline: "Collects what’s left of the floor.",
    collectionSlug: "smb",
    bondingPct: 63.3,
    graduated: false,
  },
];

export const coins: Coin[] = COIN_SEED.map((seed) => {
  const col = collectionBySlug.get(seed.collectionSlug);
  const h = hashString(seed.ticker);
  const mcapUsd = seed.graduated ? 1_200_000 + (h % 900_000) : 80_000 + (h % 400_000);
  const volume24hUsd = Math.round(mcapUsd * (0.12 + (h % 20) / 100));
  const feesSweepSol = Number(((volume24hUsd / 180) * 0.8).toFixed(2));
  return {
    ...seed,
    image: col?.cover ?? "/svg/sweep-mark.svg",
    mcapUsd,
    volume24hUsd,
    change24h: ((h % 240) - 90) / 10,
    feesSweepSol,
    pumpUrl: `https://pump.fun/coin/${seed.mint}`,
    dexscreenerUrl: `https://dexscreener.com/solana/${seed.mint}`,
  };
});

function everyImage(): { file: string; slug: string; name: string }[] {
  return catalog.images.map((img) => ({
    file: img.file,
    slug: img.slug,
    name: img.name,
  }));
}

function buildSweeps(): SweepReceipt[] {
  const demo = appConfig.dryRun;
  return everyImage().map((img, index) => {
    const col = collectionBySlug.get(img.slug);
    const h = hashString(img.file);
    const floor = col?.floorSol ?? 1;
    const solPaid = Number((floor * (0.97 + (h % 11) / 100)).toFixed(2));
    const held = h % 5 !== 0;
    const day = new Date(Date.UTC(2026, 8, 1 + (index % 18), 8 + (h % 12), h % 60));
    return {
      id: `sweep-${index}-${img.file}`,
      collectionSlug: img.slug,
      collectionName: col?.name ?? img.name,
      image: nftSrc(img.file),
      tokenName: `${col?.name ?? img.name} #${(h % 9000) + 100}`,
      solPaid,
      floorAtBuy: floor,
      buyTx: fakeSig(`buy:${img.file}`),
      burnTx: held ? undefined : fakeSig(`burn:${img.file}`),
      wallet: col?.sweepWallet ?? fakePubkey("sweep:unknown"),
      mint: fakePubkey(`nft:${img.file}`),
      held,
      sweptAt: day.toISOString(),
      demo,
    };
  });
}

export const sweeps: SweepReceipt[] = buildSweeps();

export const protocolStats = {
  coinsLaunched: coins.length + 41,
  collections: collections.filter((c) => c.coinsPaired > 0).length,
  nftsSwept: sweeps.length,
  solSwept: Number(sweeps.reduce((sum, s) => sum + s.solPaid, 0).toFixed(2)),
  updatedAgo: "12s ago",
};

export function getCollection(slug: string) {
  return collectionBySlug.get(slug);
}

export function getCoin(mint: string) {
  return coins.find((c) => c.mint === mint);
}

export function coinsForCollection(slug: string) {
  return coins.filter((c) => c.collectionSlug === slug);
}

export function sweepsForCollection(slug: string) {
  return sweeps.filter((s) => s.collectionSlug === slug);
}

export function rankedFloors() {
  return [...collections].sort((a, b) => b.floorSol - a.floorSol);
}

export function floorHistory(slug: string) {
  const col = collectionBySlug.get(slug);
  const current = col?.floorSol ?? 1;
  const h = hashString(slug);
  const points: { label: string; floor: number }[] = [];
  let v = current * 0.72;
  for (let i = 0; i < 14; i += 1) {
    const drift = (((h >> (i % 12)) & 7) - 3) / 90;
    v = Math.max(0.05, v * (1 + drift));
    const d = new Date(Date.UTC(2026, 8, 6 + i));
    points.push({
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }),
      floor: Number(v.toFixed(2)),
    });
  }
  points[points.length - 1].floor = current;
  return points;
}

export function protocolSweepSeries() {
  const h = 42;
  return Array.from({ length: 30 }, (_, i) => {
    const v = 3800 + ((h * (i + 3)) % 4200) + Math.sin(i / 3) * 800;
    const d = new Date(Date.UTC(2026, 7, 21 + i));
    return {
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }),
      sol: Number(v.toFixed(0)),
    };
  });
}

export const allNftImageCount = catalog.images.length;
