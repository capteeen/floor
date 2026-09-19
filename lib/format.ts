export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function hashString(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export function fakePubkey(seed: string, length = 44) {
  let x = hashString(seed) || 1;
  let out = "";
  for (let i = 0; i < length; i += 1) {
    x = Math.imul(x ^ (i + 1) * 2654435761, 1597334677) >>> 0;
    out += BASE58[x % BASE58.length];
  }
  return out;
}

export function fakeSig(seed: string) {
  return fakePubkey(`sig:${seed}`, 88);
}

export function truncateMiddle(value: string, start = 4, end = 4) {
  if (value.length <= start + end + 1) return value;
  return `${value.slice(0, start)}…${value.slice(-end)}`;
}

export function formatSol(value: number, digits = 2) {
  return `${value.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })} SOL`;
}

export function formatUsd(value: number) {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

export function formatNumber(value: number) {
  return value.toLocaleString("en-US");
}

export function formatPct(value: number) {
  const abs = Math.abs(value).toFixed(1);
  return `${value >= 0 ? "+" : "−"}${abs}%`;
}

export function nftSrc(file: string) {
  return `/nft-images/${file}`;
}

export function coverSrc(file: string) {
  return `/covers/${file}`;
}
